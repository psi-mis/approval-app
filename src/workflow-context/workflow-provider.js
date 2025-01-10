import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useSelectionContext } from '../selection-context/index.js'
import { ErrorMessage, Loader, RetryButton } from '../shared/index.js'
import { WorkflowContext } from './workflow-context.js'

const query = {
    approvalStatus: {
        // resource: 'dataApprovals/approvals',
        resource: 'dataApprovals',
        params: ({ workflow, period, orgUnit, attributeOptionCombo }) => ({
            wf: workflow.id,
            pe: period.id,
            ou: orgUnit.id,
            aoc: attributeOptionCombo.id
        }),
    },
}

const WorkflowProvider = ({ children }) => {
    const { workflow, period, orgUnit, attributeOptionCombo } = useSelectionContext();
    const { fetching, error, data, called, refetch } = useDataQuery(query, {
        lazy: true,
    });
    
    const fetchApprovalStatus = () => refetch({ workflow, period, orgUnit, attributeOptionCombo });

    useEffect(() => {
        if (workflow && period && orgUnit && attributeOptionCombo) {
            fetchApprovalStatus();
        }
    }, [workflow, period, orgUnit, attributeOptionCombo]);
    
    // if(workflow && workflow.dataSets.length === 0) {
        
    // }
    // else if (!workflow || !period || !orgUnit || !attributeOptionCombo) {
    if (!workflow || !period || !orgUnit) {
        return null
    }

    if( workflow.dataSets.length > 0 &&  !attributeOptionCombo) {
        return null
    }
    // if (!workflow || !period || !orgUnit) {
    //     if(workflow && workflow.dataSets.length > 0 && !attributeOptionCombo ) {
    //         return null
    //     }
    // }
    
    if (attributeOptionCombo && (fetching || !called)) {
        return <Loader />
    }

    if (error) {
        return (
            <ErrorMessage title={i18n.t('Could not load approval data')}>
                <p>{error.message}</p>
                <RetryButton onClick={fetchApprovalStatus}>
                    {i18n.t('Retry loading approval data')}
                </RetryButton>
            </ErrorMessage>
        )
    }
    
    const {
        state: approvalStatus,
        approvedBy,
        approvedAt,
        acceptedBy,
        acceptedAt,
        ...allowedActions
    } = data?.approvalStatus || {}

    return (
        <WorkflowContext.Provider
            value={{
                approvalStatus,
                approvedBy,
                approvedAt,
                acceptedBy,
                acceptedAt,
                allowedActions,
                refresh: refetch,
                params: {
                    wf: workflow.id,
                    pe: period.id,
                    ou: orgUnit.id,
                    aoc: attributeOptionCombo?.id,
                },
            }}
        >
            {children}
        </WorkflowContext.Provider>
    )
}

WorkflowProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export { WorkflowProvider }
