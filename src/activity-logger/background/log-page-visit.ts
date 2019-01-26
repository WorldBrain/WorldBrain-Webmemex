import { Tabs } from 'webextension-polyfill-ts'
import moment from 'moment'

import { TabManager } from './tab-manager'
import analyzePage, { PageAnalyzer } from '../../page-analysis/background'
import * as searchIndex from '../../search'
import { FavIconChecker } from './types'
import getPDFFingerprint from './pdffingerprint'

interface Props {
    tabManager: TabManager
    pageFetch?: typeof searchIndex.getPage
    momentLib?: typeof moment
    pageCreate?: typeof searchIndex.addPage
    visitCreate?: typeof searchIndex.addVisit
    pageTermsAdd?: typeof searchIndex.addPageTerms
    favIconCheck?: FavIconChecker
    pageAnalyzer?: PageAnalyzer
}

export default class PageVisitLogger {
    private _tabManager: TabManager
    private _checkFavIcon: FavIconChecker
    private _analyzePage: PageAnalyzer
    private _addPageTerms: typeof searchIndex.addPageTerms
    private _createPage: typeof searchIndex.addPage
    private _fetchPage: typeof searchIndex.getPage
    private _createVisit: typeof searchIndex.addVisit
    private _moment: typeof moment

    constructor({
        tabManager,
        pageAnalyzer = analyzePage,
        pageTermsAdd = searchIndex.addPageTerms,
        pageCreate = searchIndex.addPage,
        pageFetch = searchIndex.getPage,
        visitCreate = searchIndex.addVisit,
        favIconCheck = searchIndex.domainHasFavIcon,
        momentLib = moment,
    }: Props) {
        this._tabManager = tabManager
        this._analyzePage = pageAnalyzer
        this._fetchPage = pageFetch
        this._addPageTerms = pageTermsAdd
        this._createPage = pageCreate
        this._createVisit = visitCreate
        this._checkFavIcon = favIconCheck
        this._moment = momentLib
    }

    /**
     * Performs page data indexing for a browser tab. Immediately
     * indexes display data, and searchable title/URL terms, but returns
     * an async callback for manual invocation of text indexing.
     */
    async logPageStub(
        tab: Tabs.Tab,
        allowScreenshot: boolean,
        secsSinceLastVisit = 20,
    ) {
        const internalTabState = this._tabManager.getTabState(tab.id)

        // Cannot process if tab not tracked
        if (internalTabState == null) {
            return
        }

        try {
            const existingPage = await this._fetchPage(tab.url)

            if (existingPage != null) {
                // Store just new visit if existing page has been indexed recently (`secsSinceLastIndex`)
                //  also clear scheduled content indexing
                if (
                    this._moment(existingPage.latest).isAfter(
                        this._moment(internalTabState.visitTime).subtract(
                            secsSinceLastVisit,
                            'seconds',
                        ),
                    )
                ) {
                    this._tabManager.clearScheduledLog(tab.id)

                    return this._createVisit(
                        tab.url,
                        internalTabState.visitTime,
                    )
                }
            }

            const allowFavIcon = !(await this._checkFavIcon(tab.url))
            let analysisRes
            try {
                analysisRes = await this._analyzePage({
                    tabId: tab.id,
                    allowFavIcon,
                    allowScreenshot,
                })
            } catch (err) {
                console.error(err)
                return
            }

            // Don't index full-text in this stage
            delete analysisRes.content.fullText

            const isPDF = tab.url.endsWith('.pdf')
            let PDFFingerprint = null
            if (isPDF) {
                getPDFFingerprint(tab.url).then(
                    fingerprint => (PDFFingerprint = fingerprint),
                )
            }

            console.log({
                url: tab.url,
                isPDF,
                PDFFingerprint,
                ...analysisRes,
            })
            await this._createPage({
                pageDoc: {
                    url: tab.url,
                    isPDF,
                    PDFFingerprint,
                    ...analysisRes,
                },
                visits: [internalTabState.visitTime],
                rejectNoContent: false,
            })
        } catch (err) {
            this._tabManager.clearScheduledLog(tab.id)
            throw err
        }
    }

    async logPageVisit(
        tab: Tabs.Tab,
        allowScreenshot: boolean,
        textOnly = true,
    ) {
        let analysisRes
        try {
            analysisRes = await this._analyzePage({
                tabId: tab.id,
                allowFavIcon: false,
                allowScreenshot,
            })
        } catch (err) {
            console.error(err)
            return
        }

        const pageDoc = { url: tab.url, ...analysisRes }

        if (textOnly) {
            return this._addPageTerms({ pageDoc })
        }

        const internalTabState = this._tabManager.getTabState(tab.id)

        // Cannot process if tab not tracked
        if (internalTabState == null) {
            return
        }

        await this._createPage({
            pageDoc,
            visits: [internalTabState.visitTime],
        })
    }
}
