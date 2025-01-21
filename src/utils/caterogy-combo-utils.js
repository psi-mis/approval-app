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
                const attributeCombo = getAttributeComboById(metadata, dataSet.categoryCombo.id)
                categoryComboList.push(attributeCombo)
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

export const getAttributeComboById = (metadata, attributeComboById) => {
    return metadata.categoryCombos.find((item => item.id === attributeComboById))
}

export const getCategoryComboByCategoryOptionCombo = (metadata, categoryOptionComboId) => {
    const categoryCombos = metadata.categoryCombos
    for( const categoryCombo of categoryCombos ) {
        const foundCatOptionCombo = categoryCombo.categoryOptionCombos?.find((item => item.id === categoryOptionComboId))
        if( foundCatOptionCombo ) {
            return categoryCombo
        }
    }
    
    return
}

export const getCategoryOptionComboById = (metadata, categoryOptionComboId) => {
    const categoryCombos = metadata.categoryCombos
    for( const categoryCombo of categoryCombos ) {
        const foundCatOptionCombo = categoryCombo.categoryOptionCombos?.find((item => item.id === categoryOptionComboId))
        if( foundCatOptionCombo ) {
            return foundCatOptionCombo
        }
    }
    
    return
}

export const getAttributeOptionComboIdExistInWorkflow = ( metadata, workflow, attributeOptionComboId, orgUnitId ) => {
    const dataSets = JSON.parse(JSON.stringify(workflow.dataSets));
    if( dataSets.length > 0 ) {
        for( const dataSet of dataSets) {
            const categoryCombo = getAttributeComboById(metadata, dataSet.categoryCombo.id)
            const foundAttrOptionCombo = categoryCombo.categoryOptionCombos.find((optionCombo => optionCombo.id === attributeOptionComboId))
            if(foundAttrOptionCombo) {
                const foundCategoryOptions = foundAttrOptionCombo.categoryOptions.filter(
                    (categoryOption) =>
                        isOptionAssignedToOrgUnit({
                            categoryOption,
                            orgUnitId,
                        })
                );
                
                if( foundCategoryOptions.length === foundAttrOptionCombo.categoryOptions)
                {
                    return foundAttrOptionCombo
                }
            }
        }
    }
  
    return
}

export const getCategoryOptionsByCategoryOptionCombo = (metadata, categoryOptionComboId) => {
    const categoryCombos = metadata.categoryCombos
    for( const categoryCombo of categoryCombos ) {
        const foundCatOptionCombo = categoryCombo.categoryOptionCombos?.find((item => item.id === categoryOptionComboId))
        if( foundCatOptionCombo ) {
            return foundCatOptionCombo.categoryOptions
        }
    }
    
    return
}

export const getDataSetReportFilter = (metadata, attributeOptionCombo) => {
    if( !attributeOptionCombo ) return
    
    const categoryOptions = attributeOptionCombo.categoryOptions
    const catCombo = getCategoryComboByCategoryOptionCombo(metadata, attributeOptionCombo.id)
    if( catCombo ) {
        if( catCombo.isDefault ) return
        // Find and map categoryOptions to categories as an array of strings
        return categoryOptions.map(option => {
            const category = catCombo.categories.find(category =>
                category.categoryOptions.some(catOption => catOption.id === option.id)
            )
        
            if (category) {
                return `${category.id}:${option.id}`;
            }
            
            return null // In case no match is found
        }).filter(Boolean) // Remove any null values
    }
    
    return
}

export const getDataSetsInWorkflowByAttributeOptionCombo = (metadata, workflow, attributeOptionCombo) => {
    const result = [];
    
    if( attributeOptionCombo ) {
        const dataSets = workflow?.dataSets
        for( const dataSet of dataSets ) {
            const catCombo = getAttributeComboById(metadata, dataSet.categoryCombo.id)
            const found = catCombo.categoryOptionCombos.find((dsCatOptionCombo => dsCatOptionCombo.id === attributeOptionCombo.id))
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

    const categoryCombo = categoryCombos.find((item => item.id === dataSet.categoryCombo?.id))
    if (!categoryCombo) {
        console.warn(`Could not find a category combo for data set with id ${dataSet.id}`)
        return false
    }
    
    // return categoryCombo
    return true
}


export const isOptionAssignedToOrgUnit = ({ categoryOption, orgUnitId }) => {
    // by default,
    if (!categoryOption?.organisationUnits?.length) {
        return true;
    }
    return categoryOption?.organisationUnits.includes(orgUnitId);
}