import { useMemo } from 'react'
import { useSelectionContext } from '../../selection-context/index.js'
import { getDataSetsInWorkflowByAttributeOptionCombo } from '../../utils/caterogy-combo-utils.js'

export const useSelectedDataSet = () => {
    const { workflow, dataSet, attributeOptionCombo} = useSelectionContext()
    const availableDataSets = getDataSetsInWorkflowByAttributeOptionCombo(workflow, attributeOptionCombo)
    
    return useMemo(() => {
        const dataSets = (!attributeOptionCombo) ? workflow?.dataSets : availableDataSets
        
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
