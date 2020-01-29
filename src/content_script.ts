import 'babel-polyfill'
import { RemoteFunctionRegistry } from './util/webextensionRPC'
import 'src/activity-logger/content_script'
import 'src/page-analysis/content_script'
import 'src/search-injection/content_script'
import AnnotationsManager from 'src/annotations/annotations-manager'
import initContentTooltip from 'src/content-tooltip/content_script'
import 'src/direct-linking/content_script'
import initRibbonAndSidebar from './sidebar-overlay/content_script'
import 'src/backup-restore/content_script'
import ToolbarNotifications from 'src/toolbar-notification/content_script'
import initSocialIntegration from 'src/social-integration/content_script'
import { HighlightInteraction } from './highlighting/ui/highlight-interactions'

const remoteFunctionRegistry = new RemoteFunctionRegistry()

const toolbarNotifications = new ToolbarNotifications()
toolbarNotifications.registerRemoteFunctions(remoteFunctionRegistry)
// toolbarNotifications.showToolbarNotification('tooltip-first-close')
window['toolbarNotifications'] = toolbarNotifications

const annotationsManager = new AnnotationsManager()
const highlighter = new HighlightInteraction()

initContentTooltip({ toolbarNotifications })
initRibbonAndSidebar({ annotationsManager, toolbarNotifications, highlighter })

initSocialIntegration({ annotationsManager })