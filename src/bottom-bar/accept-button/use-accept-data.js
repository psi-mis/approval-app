import { useDataMutation } from '@dhis2/app-runtime'

export const ACCEPT_DATA_MUTATION = {
    resource: 'dataAcceptances',
    type: 'create',
    params: ({ wf, pe, ou }) => ({ wf, pe, ou }),
}

export const useAcceptData = () => useDataMutation(ACCEPT_DATA_MUTATION)
