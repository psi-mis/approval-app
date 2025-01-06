import { useMemo } from 'react'
import { useSelectionContext } from '../../selection-context/index.js'
import { getDataSetsInWorkflowByCategoryOptionCombo } from '../../utils/caterogy-combo-utils.js'

export const useSelectedDataSet = () => {
    const { workflow, dataSet, categoryOptionCombo} = useSelectionContext()
    const availableDataSets = getDataSetsInWorkflowByCategoryOptionCombo(workflow, categoryOptionCombo)
    
    return useMemo(() => {
        const dataSets = (!categoryOptionCombo) ? workflow?.dataSets : availableDataSets
        
        if (dataSets.length === 1) {
            return dataSets[0].id
        }

        if (dataSet) {
            const found = dataSets.find(({ id }) => id === dataSet)
            return found?.id
        }

        return null
    }, [workflow, dataSet])
}
