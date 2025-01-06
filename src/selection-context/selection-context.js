import { createContext } from 'react'

const defaultFn = () => {
    throw new Error('Selection Context has not been initialized')
}

const SelectionContext = createContext({
    workflow: {},
    period: {},
    orgUnit: {},
    categoryOptionCombo: {},
    selectWorkflow: defaultFn,
    selectPeriod: defaultFn,
    selectOrgUnit: defaultFn,
    selectCategoryOptionCombo: defaultFn,
    clearAll: defaultFn,
    setOpenedSelect: defaultFn,
})

export { SelectionContext }
