import { useDataMutation } from '@dhis2/app-runtime'

export const UNACCEPT_DATA_MUTATION = {
    resource: 'dataAcceptances',
    type: 'delete',
    params: ({ wf, pe, ou }) => ({ wf, pe, ou }),
}

export const useUnacceptData = () => useDataMutation(UNACCEPT_DATA_MUTATION)
