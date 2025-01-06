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
        params: ({ workflow, period, orgUnit, categoryOptionCombo }) => ({
            wf: workflow.id,
            pe: period.id,
            ou: orgUnit.id,
            aoc: categoryOptionCombo.id
        }),
    },
}

const WorkflowProvider = ({ children }) => {
    const { workflow, period, orgUnit, categoryOptionCombo } = useSelectionContext();
    const { fetching, error, data, called, refetch } = useDataQuery(query, {
        lazy: true,
    });
    
    const fetchApprovalStatus = () => refetch({ workflow, period, orgUnit, categoryOptionCombo });

    useEffect(() => {
        if (workflow && period && orgUnit && categoryOptionCombo) {
            fetchApprovalStatus();
        }
    }, [workflow, period, orgUnit, categoryOptionCombo]);
    
    // if(workflow && workflow.dataSets.length === 0) {
        
    // }
    // else if (!workflow || !period || !orgUnit || !categoryOptionCombo) {
    if (!workflow || !period || !orgUnit) {
        return null
    }

    if( workflow.dataSets.length > 0 &&  !categoryOptionCombo) {
        return null
    }
    // if (!workflow || !period || !orgUnit) {
    //     if(workflow && workflow.dataSets.length > 0 && !categoryOptionCombo ) {
    //         return null
    //     }
    // }
    
    if (categoryOptionCombo && (fetching || !called)) {
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
        ...allowedActions
    } = data?.approvalStatus || {}

    return (
        <WorkflowContext.Provider
            value={{
                approvalStatus,
                approvedBy,
                approvedAt,
                allowedActions,
                refresh: refetch,
                params: {
                    wf: workflow.id,
                    pe: period.id,
                    ou: orgUnit.id,
                    aoc: categoryOptionCombo?.id,
                    // aoc: workflow.dataSets.map(dataset =>
                    //     dataset.categoryCombo.categoryOptionCombos.map(combo => combo.id)
                    // ).join(",")
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
