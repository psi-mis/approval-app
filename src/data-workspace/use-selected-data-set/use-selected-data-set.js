import { useMemo } from 'react'
import { useSelectionContext } from '../../selection-context/index.js'

export const useSelectedDataSet = () => {
    const { workflow, dataSet } = useSelectionContext()

    return useMemo(() => {
        if (workflow.dataSets.length === 1) {
            return workflow.dataSets[0].id
        }

        if (dataSet) {
            const found = workflow.dataSets.find(({ id }) => id === dataSet)
            return found?.id
        }

        return null
    }, [workflow, dataSet])
}
