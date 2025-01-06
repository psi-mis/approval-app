import React from 'react'
import { useSelectionContext } from '../selection-context/index.js'
import { getDataSetsInWorkflowByCategoryOptionCombo } from '../utils/caterogy-combo-utils.js'
import { DataSetNavigation } from './data-set-navigation/index.js'
import { Display } from './display/index.js'
import { TitleBar } from './title-bar/index.js'
import { useSelectedDataSet } from './use-selected-data-set/index.js'

const DataWorkspace = () => {
    const { workflow, categoryOptionCombo, selectDataSet } = useSelectionContext()
    const selectedDataSet = useSelectedDataSet()
    
    const dataSets = getDataSetsInWorkflowByCategoryOptionCombo(workflow, categoryOptionCombo)

    return (
        <>
            <TitleBar />
            <DataSetNavigation
                dataSets={dataSets}
                selected={selectedDataSet}
                onChange={selectDataSet}
            />
            <Display dataSetId={selectedDataSet} />
        </>
    )
}

export { DataWorkspace }
