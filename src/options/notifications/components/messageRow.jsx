import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import localStyles from './UnreadMessages.css'

const iconClasses = classNames({
    'material-icons': true,
    [localStyles.icon]: true,
})

const messageRow = ({ doc, handleClick, isOpen }) => (
    <tr
        onClick={() => handleClick(doc)}
        className={localStyles.notviewed}
        key={doc.date}
    >
        <td colSpan={3}>
            {doc.title}
            <div className={localStyles.messageReadOrUnreadIcon}>
                <i className={iconClasses}>
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </i>
            </div>
            {isOpen && (
                <div className={localStyles.toggle} key={doc.title}>
                    <div
                        className={localStyles.docBody}
                        dangerouslySetInnerHTML={{ __html: doc.body }}
                    />
                    <br />
                    <br />
                    <div className={localStyles.dateNotif}>
                        {new Date(doc.date).toDateString()}
                    </div>
                </div>
            )}
        </td>
    </tr>
)

messageRow.propTypes = {
    // State
    isOpen: PropTypes.bool.isRequired,

    // Event handlers
    handleClick: PropTypes.func.isRequired,

    // Data
    doc: PropTypes.object.isRequired,
}

export default messageRow
