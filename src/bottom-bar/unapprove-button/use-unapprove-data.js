import { useDataMutation } from '@dhis2/app-runtime'

export const UNAPPROVE_DATA_MUTATION = {
    resource: 'dataApprovals',
    type: 'delete',
    params: ({ wf, pe, ou }) => ({ wf, pe, ou }),
}

export const useUnapproveData = () => useDataMutation(UNAPPROVE_DATA_MUTATION)
