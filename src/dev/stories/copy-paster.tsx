import React from 'react'
import { storiesOf } from '@storybook/react'
import TemplateList from 'src/overview/copy-paster/components/TemplateList'
import TemplateRow from 'src/overview/copy-paster/components/TemplateRow'
import TemplateEditor from 'src/overview/copy-paster/components/TemplateEditor'

const stories = storiesOf('Copy Paster', module)

const TEMPLATE_MOCKS = [
    {
        id: 'markdown',
        title: 'Markdown',
        code: 'nocode()',
        isFavourite: false,
    },
    {
        id: 'roam',
        title: 'For Roam',
        code: 'nocode()',
        isFavourite: true,
    },
    {
        id: 'html',
        title: 'HTML Link',
        code: 'nocode()',
        isFavourite: false,
    },
]

stories.add('Template Row', () => (
    <TemplateRow
        template={TEMPLATE_MOCKS[0]}
        onClick={() => console.log('click')}
        onClickSetIsFavourite={(isFavourite) =>
            console.log('isFavourite', isFavourite)
        }
        onClickEdit={() => console.log('edit')}
    />
))

const TEMPLATE_LIST_ACTIONS = {
    onClickNew: () => {
        console.log('new')
    },
    onClick: (id) => {
        console.log('click', id)
    },
    onClickSetIsFavourite: (id, isFavourite) => {
        console.log('isFavourite', id, isFavourite)
    },
    onClickEdit: (id) => {
        console.log('edit', id)
    },
}

stories.add('Template List - Loading', () => (
    <TemplateList isLoading templates={[]} {...TEMPLATE_LIST_ACTIONS} />
))

stories.add('Template List - Empty', () => (
    <TemplateList templates={[]} {...TEMPLATE_LIST_ACTIONS} />
))

stories.add('Template List', () => (
    <TemplateList templates={TEMPLATE_MOCKS} {...TEMPLATE_LIST_ACTIONS} />
))

const TEMPLATE_EDITOR_ACTIONS = {
    onClickSave: () => {
        console.log('save')
    },
    onClickCancel: () => {
        console.log('cancel')
    },
    onClickDelete: () => {
        console.log('delete')
    },
    onClickHowto: () => {
        console.log('howto')
    },
    onTitleChange: (s) => {
        console.log('title:', s)
    },
    onCodeChange: (s) => {
        console.log('code:', s)
    },
}

stories.add('Template Editor - New', () => (
    <TemplateEditor {...TEMPLATE_EDITOR_ACTIONS} />
))

stories.add('Template Editor - Editing', () => (
    <TemplateEditor template={TEMPLATE_MOCKS[0]} {...TEMPLATE_EDITOR_ACTIONS} />
))
