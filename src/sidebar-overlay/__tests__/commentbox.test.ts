import * as testConstants from './constants'
import * as constants from '../constants'
import { getMemexPage, killBrowser } from './Puppeteer'

jest.setTimeout(100000)
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000

describe('Memex CommentBox Test Suite', async () => {
    let page

    beforeAll(async () => {
        page = await getMemexPage()
        await page.waitFor(2000)
    })

    test('Check if commentbox is focused', async () => {
        const navPromise = page.waitForNavigation()
        await page.reload(10000, { waitUntil: 'domcontentloaded' })
        await navPromise
        await page.waitForSelector('#app a[draggable=true]')
        const $commentButton = (await page.$$(
            '#app a[draggable=true] button',
        ))[1]
        $commentButton.click()
        await page.waitForSelector('.bm-menu textarea')
        const isActive = await page.$eval('.bm-menu textarea', textarea => {
            return document.activeElement === textarea
        })
        expect(isActive).toBeTruthy()
    })

    test('Write a new comment and test rows', async () => {
        const getRows = async () => {
            const rows = await page.$eval('.bm-menu textarea', textarea => {
                return textarea.rows
            })
            return rows
        }
        const rowsBefore = await getRows()
        await page.type('.bm-menu textarea', 'Comment from puppeteer')
        const rowsAfter = await getRows()

        // Test the row size
        expect(rowsBefore).toBe(constants.DEFAULT_ROWS)
        expect(rowsAfter).toBe(constants.MAXED_ROWS)
    })

    const getBgColor = async () => {
        const color = await page.$eval(
            '#add_comment_btn',
            btn => getComputedStyle(btn).backgroundColor,
        )
        return color
    }

    test('Check saving comment behaviour', async () => {
        const bgColorBefore = await getBgColor()

        const saveButton = await page.$('.bm-menu button')
        saveButton.click()
        // Query fetches div having an id, which at the moment is just the annotation
        const savedComment = await page.waitForSelector(
            '#memex_sidebar_panel div[id]:not(#add_comment_btn):not(#tags_container):not(#memex_sidebar_loader)',
        )
        const text = await savedComment.$eval(
            'div:nth-child(3)',
            div => div.textContent,
        )

        expect(savedComment).toBeDefined()
        expect(text).toBe('Comment from puppeteer')

        // checks if comment box gets hidden
        const display = await page.$eval('.bm-menu textarea', commentbox => {
            const container = commentbox.parentElement
            return getComputedStyle(container).display
        })
        expect(display).toBe('none')

        const bgColorAfter = await getBgColor()
        expect(bgColorBefore).toBe(testConstants.grayColor)
        expect(bgColorAfter).toBe(testConstants.greenColor)
    })

    test('Check actions of Add Comment button', async () => {
        await page.click('#add_comment_btn')
        const bgColor = await page.$eval('#add_comment_btn', btn => {
            const styles = getComputedStyle(btn)
            return styles.backgroundColor
        })
        expect(bgColor).toBe(testConstants.grayColor)

        const isShown = await page.$eval('.bm-menu textarea', textarea => {
            const containerDisplay = getComputedStyle(textarea.parentElement)
                .display
            return containerDisplay === 'block'
        })
        expect(isShown).toBeTruthy()
    })

    test('Write comment with tags', async () => {
        await page.type('.bm-menu textarea', 'Writing a comment with tags')
        const tagsContainer = await page.$('.bm-menu #tags_container')
        const tagsHolder = await tagsContainer.$('div')
        expect(tagsHolder).toBeDefined()

        tagsHolder.click()

        const tagsDropdown = await page.waitForSelector(
            '#tags_container div form input',
        )
        expect(tagsDropdown).toBeDefined()

        // Add 3 tags
        await tagsDropdown.type('tag1')
        const addTag = await page.waitForSelector('#tags_container div div>div')
        addTag.click()
        await page.waitFor(400)
        await tagsDropdown.type('tag2')
        await page.waitFor(400)
        await tagsDropdown.press('Enter')
        await page.waitFor(400)
        await tagsDropdown.type('tag3')
        await page.waitFor(400)
        await tagsDropdown.press('Enter')
        // Check if tags have been updated in tagHolder
        await page.click('.bm-menu textarea')
        const tagHolderList = async () => {
            const length = await tagsContainer.$$eval(
                'div>span',
                list => list.length,
            )
            return length
        }
        // one for the '+' span
        expect(await tagHolderList()).toBe(4)
        await tagsContainer.click()
        // write more tags again
        await tagsDropdown.type('tag4')
        await page.waitFor(300)
        await tagsDropdown.press('Enter')
        // write more tags again
        await tagsDropdown.type('tag5')
        await page.waitFor(300)
        await tagsDropdown.press('Enter')

        await page.click('.bm-menu textarea')
        expect(await tagHolderList()).toBe(5)

        // Save comment
        await page.click('.bm-menu button')
        await page.waitFor(300)
        const savedComments = await page.$$(
            '#memex_sidebar_panel div[id]:not(#add_comment_btn):not(#tags_container):not(#memex_sidebar_loader)',
        )
        expect(savedComments.length).toBe(2)
    })

    afterAll(async () => {
        await killBrowser()
    })
})
