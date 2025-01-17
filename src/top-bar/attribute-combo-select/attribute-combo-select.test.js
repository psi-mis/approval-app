import { CustomDataProvider } from '@dhis2/app-runtime'
import { Popover, OrganisationUnitTree, Tooltip } from '@dhis2/ui'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mount, shallow } from 'enzyme'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { useAppContext } from '../../app-context/index.js'
import { readQueryParams } from '../../navigation/read-query-params.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { ContextSelect } from '../context-select/context-select.js'
import { CAT_OPTION_COMBO, AttributeComboSelect } from './attribute-combo-select.js'

// Mock dependencies
jest.mock('../../app-context/use-app-context', () => ({
    useAppContext: jest.fn(),
}));
jest.mock('../../selection-context/index', () => ({
    useSelectionContext: jest.fn(),
}));
jest.mock('../../utils/caterogy-combo-utils', () => ({
    getCategoryCombos: jest.fn(),
    getCategoryOptionComboById: jest.fn(),
    getCategoryComboByCategoryOptionCombo: jest.fn(),
}));

jest.mock('../../navigation/read-query-params.js', () => ({
    readQueryParams: jest.fn(),
}))

const mockWorkflows = [
    {
        displayName: 'Workflow a',
        id: 'i5m0JPw4DQi',
        periodType: 'Daily',
        dataSets: [
            {
                name: "Data set 1",
                id: "dataset_1",
                periodType: "Daily",
                categoryCombo: {
                    displayName: "Combo 1",
                    id: "combo_1",
                    categories: [
                        {
                            name: "Category 1",
                            displayName: "Category 1",
                            id: "category_1",
                            categoryOptions: [
                                {
                                    displayName: "Option 1",
                                    id: "123"
                                },
                                {
                                    displayName: "Option 2",
                                    id: "456"
                                },
                            ]
                        }
                    ], 
                    categoryOptionCombos: [
                        {
                            categoryOptions: [{id: "123" }],
                            displayName: "Option Combo 1",
                            id: "wertyuiopas"
                        },
                    ],
                    isDefault: false
                },
            }
        ]
    },
    {
        displayName: 'Workflow B',
        id: 'rIUL3hYOjJc',
        periodType: 'Daily',
        dataSets: [
            {
                name: "Data set 2",
                id: "dataset_2",
                periodType: "Daily",
                categoryCombo: {
                    displayName: "Combo 1",
                    id: "combo_1",
                    categories: [
                        {
                            name: "Category 1",
                            displayName: "Category 1",
                            id: "category_1",
                            categoryOptions: [
                                {
                                    displayName: "Option 1",
                                    id: "123"
                                },
                                {
                                    displayName: "Option 2",
                                    id: "456"
                                },
                            ]
                        }
                    ], 
                    categoryOptionCombos: [
                        {
                            categoryOptions: [{id: "123" }],
                            displayName: "Option Combo 1",
                            id: "wertyuiopas"
                        },
                    ],
                    isDefault: false
                },
            }
        ]
    },
]
const mockOrgUnitRoots = [
    {
        id: 'ImspTQPwCqd',
        path: '/ImspTQPwCqd',
        displayName: 'Sierra Leone',
    },
]


beforeEach(() => {
    useAppContext.mockImplementation(() => ({
        dataApprovalWorkflows: mockWorkflows,
        organisationUnits: mockOrgUnitRoots,
        metadata: {
            categoryCombos: [
                {
                    displayName: "Combo 1",
                    id: "combo_1",
                    categories: [
                        {
                            name: "Category 1",
                            displayName: "Category 1",
                            id: "category_1",
                            categoryOptions: [
                                {
                                    displayName: "Option 1",
                                    id: "123"
                                },
                                {
                                    displayName: "Option 2",
                                    id: "456"
                                },
                            ]
                        }
                    ], 
                    categoryOptionCombos: [
                        {
                            categoryOptions: [{id: "123" }],
                            displayName: "Option Combo 1",
                            id: "wertyuiopas"
                        },
                    ],
                    isDefault: false
                },
            ]
        }
    }))
    readQueryParams.mockImplementation(() => ({}))
})

afterEach(() => {
    jest.resetAllMocks()
})

describe('<AttributeComboSelect>', () => {
    it('Do not render AttributeComboSelect if a workflow is not selected', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: null,
            period: {},
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)
        expect(wrapper.children()).toHaveLength(0);
    })
    
    it('is enabled if workflow, period and orgUnit have been set', async() => {
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
        // const wrapper = shallow(<AttributeComboSelect />)
        // // Wait for the useEffect to execute
        // await act(async () => {
        //     await new Promise(resolve => setTimeout(resolve, 1000)); // wait for state updates
        // });

        
        // // expect(wrapper.findWhere(node => node.type() === ContextSelect)).toHaveLength(1);
        // expect(wrapper.find(ContextSelect)).toHaveLength(1)
        // expect(wrapper.find(ContextSelect).prop('disabled')).toBe(false)
        
        const wrapper = mount(<AttributeComboSelect />)
        // Wait for the useEffect to execute
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100)); // wait for state updates
        });
        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(false)
        // // Now assert the state after useEffect has run
        // expect(wrapper.find(ContextSelect).prop('placeholder')).toBe('1 selection');
    })
    
    // it('is disabled if a period and an orgUnit have not been set', () => {
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: mockWorkflows[0],
    //         period: null,
    //         orgUnit: null,
    //         attributeOptionCombo: {},
    //         openedSelect: '',
    //         selectPeriod: () => {},
    //         setOpenedSelect: () => {},
    //     }))
    //     const wrapper = shallow(<AttributeComboSelect />)

    //     expect(wrapper.find(ContextSelect).prop('disabled')).toBe(true)
    // })
    
    // it('is disabled if an orgUnit have not been set', () => {
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: mockWorkflows[0],
    //         period: {
    //             id: '201204',
    //             displayName: 'April 2012',
    //         },
    //         orgUnit: null,
    //         attributeOptionCombo: {},
    //         openedSelect: '',
    //         selectPeriod: () => {},
    //         setOpenedSelect: () => {},
    //     }))
    //     const wrapper = shallow(<AttributeComboSelect />)

    //     expect(wrapper.find(ContextSelect).prop('disabled')).toBe(true)
    // })


    // it('renders a placeholder text when enabled but no category option combo is selected', () => {
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: mockWorkflows[0],
    //         period: {
    //             id: '20120402',
    //         },
    //         orgUnit: mockOrgUnitRoots,
    //         attributeOptionCombo: {},
    //         openedSelect: '',
    //         selectWorkflow: () => {},
    //         setOpenedSelect: () => {},
    //     }))
    //     const wrapper = shallow(<AttributeComboSelect />)
    //     const placeholder = 'Choose a category option combo'
        
    //     // expect(wrapper.find(ContextSelect).prop('disabled')).toBe(false)
    //     expect(wrapper.find(ContextSelect).shallow().text().includes(placeholder)).toBe(false)
    // })

    // it('renders the value when a category option combo is selected', async() => {
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: {
    //             id: 'i5m0JPw4DQi',
    //         },
    //         period: {
    //             id: '20120402',
    //         },
    //         orgUnit: mockOrgUnitRoots,
    //         attributeOptionCombo: {
    //             id: "wertyuiopas"
    //         },
    //         openedSelect: '',
    //         selectWorkflow: () => {},
    //         setOpenedSelect: () => {},
    //     }))
    //     const wrapper = shallow(<AttributeComboSelect />)

    //     expect(wrapper.find(ContextSelect).prop('placeholder')).toBe('1 selection')
        
    //     // Wait for the element to appear after state update
    //     // render(<AttributeComboSelect />)
    //     // await waitFor(() => wrapper.getByText('1 selection'))
    //     // expect(screen.getByText('1 selection')).toBeInTheDocument()
    // })

    // it('opens the ContextSelect when the opened select matches "CAT_OPTION_COMBO"', () => {
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: {
    //             id: 'i5m0JPw4DQi',
    //         },
    //         period: {
    //             id: '20120402',
    //         },
    //         orgUnit: mockOrgUnitRoots,
    //         attributeOptionCombo: {},
    //         openedSelect: CAT_OPTION_COMBO,
    //         selectWorkflow: () => {},
    //         setOpenedSelect: () => {},
    //     }))
    //     const wrapper = shallow(<AttributeComboSelect />)

    //     expect(wrapper.find(ContextSelect).prop('open')).toBe(true)
    // })

    // it('calls the setOpenedSelect to open when clicking the ContextSelect button', () => {
    //     const setOpenedSelect = jest.fn()
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: {
    //             id: 'i5m0JPw4DQi',
    //         },
    //         period: {
    //             id: '20120402',
    //         },
    //         orgUnit: mockOrgUnitRoots,
    //         attributeOptionCombo: {},
    //         openedSelect: '',
    //         selectWorkflow: () => {},
    //         setOpenedSelect,
    //     }))
        
    //     shallow(<AttributeComboSelect />)
    //         .find(ContextSelect)
    //         .dive()
    //         .find(Popover)
    //         .dive()
    //         .simulate('click')

    //     expect(setOpenedSelect).toHaveBeenCalledTimes(1)
    //     expect(setOpenedSelect).toHaveBeenCalledWith(CAT_OPTION_COMBO)
    // })

    // it('calls the setOpenedSelect to close when clicking the backdrop', () => {
    //     const setOpenedSelect = jest.fn()
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: {
    //             id: 'i5m0JPw4DQi',
    //         },
    //         period: {
    //             id: '20120402',
    //         },
    //         orgUnit: mockOrgUnitRoots,
    //         attributeOptionCombo: {},
    //         openedSelect: CAT_OPTION_COMBO,
    //         selectWorkflow: () => {},
    //         setOpenedSelect,
    //     }))

    //     shallow(<AttributeComboSelect />)
    //         .find(ContextSelect)
    //         .dive()
    //         .find(Popover)
    //         .dive()
    //         .simulate('click')

    //     expect(setOpenedSelect).toHaveBeenCalledTimes(1)
    //     expect(setOpenedSelect).toHaveBeenCalledWith('')
    // })

    // it('displays the correct tooltip text when an orgUnit has not been set yet', () => {
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: {
    //             id: 'i5m0JPw4DQi',
    //         },
    //         period: {
    //             id: '20120402',
    //         },
    //         orgUnit: null,
    //         attributeOptionCombo: {},
    //         openedSelect: '',
    //         selectWorkflow: () => {},
    //         setOpenedSelect: () => {},
    //     }))

    //     const wrapper = shallow(<AttributeComboSelect />)
    //     // console.log("--- wrapper", wrapper)
    //     // console.log("wrapper.find(ContextSelect)", wrapper.find(ContextSelect))
    //     // console.log("wrapper.find(ContextSelect).dive()", wrapper.find(ContextSelect).dive())
    //     // console.log("wrapper.find(ContextSelect).dive().find(Tooltip)", wrapper.find(ContextSelect).dive().find(Tooltip))
    //     // const tooltip = wrapper.find(ContextSelect).dive().find(Tooltip)

    //     wrapper.find(ContextSelect).shallow().text().includes('Choose an organisation unit first')
    //     // expect(tooltip.prop('content')).toBe('Choose an organisation unit first')
    // })
    
    // it('displays the correct tooltip text when a period has not been set yet', () => {
    //     useSelectionContext.mockImplementation(() => ({
    //         workflow: {
    //             id: 'i5m0JPw4DQi',
    //         },
    //         period: null,
    //         orgUnit: {
    //             displayName: 'Sierra Leone',
    //             id: 'ImspTQPwCqd',
    //             path: '/ImspTQPwCqd'
    //         },
    //         attributeOptionCombo: {},
    //         openedSelect: '',
    //         selectWorkflow: () => {},
    //         setOpenedSelect: () => {},
    //     }))

    //     const wrapper = shallow(<AttributeComboSelect />)
    //     // const tooltip = wrapper.find(ContextSelect).dive().find(Tooltip)
        
        
    //     // expect(wrapper.find(ContextSelect).prop('disabled')).toBe(false)
    //     wrapper.find(ContextSelect).shallow().text().includes('Choose a period first')
        
    //     // expect(tooltip).toBe('Choose a period first')
    //     // expect(tooltip.prop('content')).toBe('Choose a period first')
    // })
})
