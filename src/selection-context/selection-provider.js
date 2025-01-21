import PropTypes from 'prop-types'
import React, { useEffect, useReducer } from 'react'
import { useAppContext } from '../app-context/index.js'
import { pushStateToHistory } from '../navigation/index.js'
import { getAttributeOptionComboIdExistInWorkflow } from '../utils/caterogy-combo-utils.js'
import { initialValues, initialWorkflowValue } from './initial-values.js'
import { SelectionContext } from './selection-context.js'

const ACTIONS = {
    SET_OPENED_SELECT: 'SET_OPENED_SELECT',
    CLEAR_ALL: 'CLEAR_ALL',
    SELECT_WORKFLOW: 'SELECT_WORKFLOW',
    SELECT_PERIOD: 'SELECT_PERIOD',
    SELECT_ORG_UNIT: 'SELECT_ORG_UNIT',
    SELECT_CAT_OPTION_COMBO: 'SELECT_CAT_OPTION_COMBO',
    SELECT_DATA_SET: 'SELECT_DATA_SET',
    SET_STATE_FROM_QUERY_PARAMS: 'SET_STATE_FROM_QUERY_PARAMS',
}

const reducer = (state, { type, payload }) => {
    switch (type) {
        case ACTIONS.SET_OPENED_SELECT:
            return {
                ...state,
                openedSelect: payload.openedSelect,
            }
        case ACTIONS.CLEAR_ALL:
            return {
                openedSelect: '',
                workflow: payload.workflow,
                period: null,
                orgUnit: null,
                attributeOptionCombo: null,
                dataSet: null,
            }
        case ACTIONS.SELECT_WORKFLOW:
            return {
                ...state,
                openedSelect: '',
                workflow: payload.workflow,
                period:
                    state.workflow &&
                    state.workflow?.periodType === payload.workflow?.periodType
                        ? state.period
                        : null,
                attributeOptionCombo: state.attributeOptionCombo
                    ? getAttributeOptionComboIdExistInWorkflow(payload.metadata, state.workflow, state.attributeOptionCombo?.id, state.orgUnit?.id)
                    : null,
                dataSet: null,
            }
        case ACTIONS.SELECT_PERIOD:
            return {
                ...state,
                /*
                 * Close dropdown only if selecting a period,
                 * not when unsetting it when the year changes
                 */
                openedSelect: payload.period?.id ? '' : state.openedSelect,
                period: payload.period,
                dataSet: null,
            }
        case ACTIONS.SELECT_ORG_UNIT:
            return {
                ...state,
                openedSelect: '',
                orgUnit: payload.orgUnit,
                dataSet: null,
            }
        case ACTIONS.SELECT_CAT_OPTION_COMBO:
            return {
                ...state,
                attributeOptionCombo: payload.attributeOptionCombo,
                dataSet: null,
            }
        case ACTIONS.SELECT_DATA_SET:
            return {
                ...state,
                dataSet: payload.dataSet,
            }
        case ACTIONS.SET_STATE_FROM_QUERY_PARAMS:
            return {
                openedSelect: '',
                ...initialValues(payload.metadata, payload.dataApprovalWorkflows),
            }
        default:
            return state
    }
}

const SelectionProvider = ({ children }) => {
    const { metadata, dataApprovalWorkflows } = useAppContext()
    const [{ openedSelect, workflow, period, orgUnit, dataSet, attributeOptionCombo}, dispatch] =
        useReducer(reducer, {
            openedSelect: '',
            ...initialValues(metadata, dataApprovalWorkflows),
        })

    const providerValue = {
        workflow,
        period,
        orgUnit,
        attributeOptionCombo,
        openedSelect,
        dataSet,
        clearAll: () =>
            dispatch({
                type: ACTIONS.CLEAR_ALL,
                payload: {
                    workflow: initialWorkflowValue(dataApprovalWorkflows),
                },
            }),
        setOpenedSelect: (fieldName) =>
            dispatch({
                type: ACTIONS.SET_OPENED_SELECT,
                payload: {
                    openedSelect: fieldName,
                },
            }),
        selectWorkflow: (workflow) =>
            dispatch({ type: ACTIONS.SELECT_WORKFLOW, payload: { metadata, workflow } }),
        selectPeriod: (period) =>
            dispatch({ type: ACTIONS.SELECT_PERIOD, payload: { period } }),
        selectOrgUnit: (orgUnit) =>
            dispatch({ type: ACTIONS.SELECT_ORG_UNIT, payload: { orgUnit } }),
        selectAttributeOptionCombo: (attributeOptionCombo) =>
            dispatch({ type: ACTIONS.SELECT_CAT_OPTION_COMBO, payload: { attributeOptionCombo } }),
        selectDataSet: (dataSet) =>
            dispatch({ type: ACTIONS.SELECT_DATA_SET, payload: { dataSet } }),
    }

    useEffect(() => {
        pushStateToHistory({ workflow, period, orgUnit, attributeOptionCombo, dataSet })
    }, [workflow, period, orgUnit, attributeOptionCombo, dataSet])

    useEffect(() => {
        const setStateFromQueryParams = () => {
            dispatch({
                type: ACTIONS.SET_STATE_FROM_QUERY_PARAMS,
                payload: {
                    metadata,
                    dataApprovalWorkflows,
                },
            })
        }
        window.addEventListener('popstate', setStateFromQueryParams)

        return () => {
            window.removeEventListener('popstate', setStateFromQueryParams)
        }
    }, [])

    return (
        <SelectionContext.Provider value={providerValue}>
            {children}
        </SelectionContext.Provider>
    )
}

SelectionProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export { SelectionProvider }
