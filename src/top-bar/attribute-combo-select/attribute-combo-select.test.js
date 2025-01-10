import { CustomDataProvider } from '@dhis2/app-runtime'
import { Popover, OrganisationUnitTree, Tooltip } from '@dhis2/ui'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { shallow } from 'enzyme'
import React from 'react'
import { useAppContext } from '../../app-context/index.js'
import { readQueryParams } from '../../navigation/read-query-params.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { ContextSelect } from '../context-select/context-select.js'
import { CAT_OPTION_COMBO, AttributeComboSelect } from './attribute-combo-select.js'

jest.mock('../../navigation/read-query-params.js', () => ({
    readQueryParams: jest.fn(),
}))

jest.mock('../../app-context/index.js', () => ({
    useAppContext: jest.fn(),
}))

jest.mock('../../selection-context/index.js', () => ({
    useSelectionContext: jest.fn(),
}))

const mockWorkflows = [
    {
        displayName: 'Workflow a',
        id: 'i5m0JPw4DQi',
        periodType: 'Daily',
    },
    {
        displayName: 'Workflow B',
        id: 'rIUL3hYOjJc',
        periodType: 'Daily',
    },
]
const mockOrgUnitRoots = [
    {
        id: 'ImspTQPwCqd',
        path: '/ImspTQPwCqd',
        displayName: 'Sierra Leone',
    },
]

afterEach(() => {
    jest.resetAllMocks()
})

beforeEach(() => {
    useAppContext.mockImplementation(() => ({
        dataApprovalWorkflows: mockWorkflows,
        organisationUnits: mockOrgUnitRoots,
    }))
    readQueryParams.mockImplementation(() => ({}))
})

describe('<AttributeComboSelect>', () => {
    it('renders a AttributeComboSelect in a ContextSelect', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {},
            period: {},
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)
        expect(wrapper.type()).toBe(ContextSelect)
    })
    
    it('is enabled if workflow, period and orgUnit have been set', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {
                id: '20120402',
            },
            orgUnit: mockOrgUnitRoots,
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(false)
    })

    it('is disabled if a workflow, period and orgUnit has not been set', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {},
            period: {},
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(true)
    })
    
    it('is disabled if a period and an orgUnit have not been set', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {},
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(true)
    })
    
    it('is disabled if an orgUnit have not been set', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {
                id: '201204',
                displayName: 'April 2012',
            },
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(true)
    })


    it('renders a placeholder text when enabled but no category option combo is selected', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {
                id: '20120402',
            },
            orgUnit: mockOrgUnitRoots,
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)
        const placeholder = 'Choose a category option combo'

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(false)
        expect(wrapper.find(ContextSelect).prop('value')).toBe(undefined)
        expect(wrapper.find(ContextSelect).prop('placeholder')).toBe(
            placeholder
        )
        expect(
            wrapper.find(ContextSelect).shallow().text().includes(placeholder)
        ).toBe(true)
    })

    it('does not render placeholder text when disabled and no category option combo is selected', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {},
            period: {},
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)
        const placeholder = 'Choose a category option combo'

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(true)
        expect(wrapper.find(ContextSelect).prop('value')).toBe(undefined)
        expect(wrapper.find(ContextSelect).prop('placeholder')).toBe(
            placeholder
        )
        expect(
            wrapper.find(ContextSelect).shallow().text().includes(placeholder)
        ).toBe(false)
    })

    it('renders the value when a category option combo is selected', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {
                id: 'i5m0JPw4DQi',
            },
            period: {
                id: '20120402',
            },
            orgUnit: mockOrgUnitRoots,
            attributeOptionCombo: {
                id: "wertyuiopas",
                displayName: "test"
            },
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)

        expect(wrapper.find(ContextSelect).prop('value')).toBe('test')
    })

    it('opens the ContextSelect when the opened select matches "CAT_OPTION_COMBO"', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {
                id: 'i5m0JPw4DQi',
            },
            period: {
                id: '20120402',
            },
            orgUnit: mockOrgUnitRoots,
            attributeOptionCombo: {},
            openedSelect: CAT_OPTION_COMBO,
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)

        expect(wrapper.find(ContextSelect).prop('open')).toBe(true)
    })

    it('calls the setOpenedSelect to open when clicking the ContextSelect button', () => {
        const setOpenedSelect = jest.fn()
        useSelectionContext.mockImplementation(() => ({
            workflow: {
                id: 'i5m0JPw4DQi',
            },
            period: {
                id: '20120402',
            },
            orgUnit: mockOrgUnitRoots,
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect,
        }))

        shallow(<AttributeComboSelect />)
            .find(ContextSelect)
            .dive()
            .find('button')
            .simulate('click')

        expect(setOpenedSelect).toHaveBeenCalledTimes(1)
        expect(setOpenedSelect).toHaveBeenCalledWith(CAT_OPTION_COMBO)
    })

    it('calls the setOpenedSelect to close when clicking the backdrop', () => {
        const setOpenedSelect = jest.fn()
        useSelectionContext.mockImplementation(() => ({
            workflow: {
                id: 'i5m0JPw4DQi',
            },
            period: {
                id: '20120402',
            },
            orgUnit: mockOrgUnitRoots,
            attributeOptionCombo: {},
            openedSelect: CAT_OPTION_COMBO,
            selectWorkflow: () => {},
            setOpenedSelect,
        }))

        shallow(<AttributeComboSelect />)
            .find(ContextSelect)
            .dive()
            .find(Popover)
            .dive()
            .simulate('click')

        expect(setOpenedSelect).toHaveBeenCalledTimes(1)
        expect(setOpenedSelect).toHaveBeenCalledWith('')
    })

    it('displays the correct tooltip text when workflow and period have not been set yet', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {},
            period: {},
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))

        const wrapper = shallow(<AttributeComboSelect />)
        const tooltip = wrapper.find(ContextSelect).dive().find(Tooltip)

        expect(tooltip.prop('content')).toBe(
            'Choose a workflow, a period and an organisation unit first'
        )
    })

    it('displays the correct tooltip text when an orgUnit has not been set yet', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {
                id: 'i5m0JPw4DQi',
            },
            period: {
                id: '20120402',
            },
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))

        const wrapper = shallow(<AttributeComboSelect />)
        const tooltip = wrapper.find(ContextSelect).dive().find(Tooltip)

        expect(tooltip.prop('content')).toBe('Choose an organisation unit first')
    })
})
