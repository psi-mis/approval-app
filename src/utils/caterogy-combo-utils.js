export const getCategoryCombos = (metadata, workflow) => {
    let categoryComboList = [];
    if(workflow === null || !workflow.dataSets || workflow.dataSets.length == 0 ) {
        categoryComboList = []
    }
    else if (workflow.dataSets) {
        const dataSets = JSON.parse(JSON.stringify(workflow.dataSets));
        for( const dataSet of dataSets) {
            const valid = checkCategoryComboAndDataSetAssigned(metadata, dataSet)
            if(valid) {
                categoryComboList.push(dataSet.categoryCombo)
            }
        }
        
        // Remove duplicate categoryCombos if any
        categoryComboList = Object.values(
            categoryComboList.reduce((acc, categoryCombo) => {
              acc[categoryCombo.id] = categoryCombo // Use the `id` as the key to ensure uniqueness
              return acc
            }, {})
        );
    }

    return categoryComboList
}

export const getCategoryComboByCategoryOptionCombo = (metadata, categoryOptionComboId) => {
    const categoryCombos = metadata.categoryCombos
    for( const categoryCombo of categoryCombos ) {
        const found = categoryCombo.categoryOptionCombos?.find((item => item.id === categoryOptionComboId))
        if( found ) {
            return categoryCombo
        }
    }
    
    return
}

export const getDataSetsInWorkflowByCategoryOptionCombo = (workflow, categoryOptionCombo) => {
    const result = [];
    
    if( categoryOptionCombo ) {
        const dataSets = workflow?.dataSets
        for( const dataSet of dataSets ) {
            const found = dataSet.categoryCombo.categoryOptionCombos.find((dsCatOptionCombo => dsCatOptionCombo.id === categoryOptionCombo.id))
            if( found ) {
                result.push(dataSet)
            }
        }
    }
    
    return result
}

/**
 * @param {*} metadata
 * @param {*} dataSet
 */
const checkCategoryComboAndDataSetAssigned = (metadata, dataSet) => {
    const categoryCombos = metadata?.categoryCombos
    
    if (!dataSet.categoryCombo?.id) {
        console.warn(`Data set with id ${dataSet.id} does not have a category combo`)
        return false
    }

    // const categoryCombo = categoryCombos[dataSet.categoryCombo?.id]
    const categoryCombo = categoryCombos.find((item => item.id === dataSet.categoryCombo?.id))
    if (!categoryCombo) {
        console.warn(`Could not find a category combo for data set with id ${dataSet.id}`)
        return false
    }
    
    // return categoryCombo
    return true
}