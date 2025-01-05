import { createContext } from 'react'

const AppContext = createContext({
    authorities: [],
    organisationUnits: [],
    dataApprovalWorkflows: [],
})

export { AppContext }
