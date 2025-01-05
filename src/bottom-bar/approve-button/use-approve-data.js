import { useDataMutation } from '@dhis2/app-runtime'

export const APPROVE_DATA_MUTATION = {
    resource: 'dataApprovals',
    type: 'create',
    params: ({ wf, pe, ou }) => ({ wf, pe, ou }),
}

export const useApproveData = ({ onComplete, onError }) =>
    useDataMutation(APPROVE_DATA_MUTATION, { onComplete, onError })
