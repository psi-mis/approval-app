import { areListsEqual, cloneJSON } from "./array-utils.js";
import { isDateAGreaterThanDateB, isDateALessThanDateB } from "./date-utils.js";

export const getCategoryCombosByFilters = (metadata, workflow, orgUnit, period, calendar) => {
    if(workflow == null || orgUnit == null || period == null ) return [];
    
    const categoryComboList = extractCategoryCombosByWorkflow(metadata, workflow)
    
    // Filter category options by orgunit
    if( categoryComboList.length > 0 ) {
        categoryComboList.map((categoryCombo) => categoryCombo.categories = filterCategoryOptionsByFilters(categoryCombo, orgUnit, period, calendar))
        
    }
    
    return categoryComboList
}

const extractCategoryCombosByWorkflow = (metadata, workflow) => {
    let categoryComboList = [];
    if(workflow === null || !workflow.dataSets || workflow.dataSets.length == 0 ) {
        categoryComboList = []
    }
    else if (workflow.dataSets) {
        const dataSets = workflow.dataSets
        for( const dataSet of dataSets) {
            const valid = verifyCategoryComboAssignment(metadata, dataSet)
            if(valid) {
                const attributeCombo = cloneJSON(getAttributeComboById(metadata, dataSet.categoryCombo.id))
                categoryComboList.push(attributeCombo)
            }
        }
        
        // Remove duplicate categoryCombos if any
        categoryComboList = Object.values(
            categoryComboList.reduce((acc, categoryCombo) => {
              acc[categoryCombo.id] = categoryCombo // Use the `id` as the key to ensure uniqueness
              return acc
            }, {})
        )
    } 
    
    return cloneJSON(categoryComboList)
}

const filterCategoryOptionsByFilters = (categoryCombo, orgUnit, period, calendar) => {
    if (!categoryCombo || !orgUnit || !period) {
        return []
    }
    
    const periodStartDate = period.startDate
    const periodEndDate = period.endDate
    
    const categories = categoryCombo.categories
    const result = (categories || []).map((category) => ({
        ...category,
        categoryOptions: category.categoryOptions.filter(
            (categoryOption) =>
                isOptionAssignedToOrgUnit({
                    categoryOption,
                    orgUnit,
                }) &&
                isOptionWithinPeriod({
                    periodStartDate,
                    periodEndDate,
                    categoryOption,
                    calendar,
                })
        ),
    }));
    
    return result;
}

export const getAttributeComboById = (metadata, attributeComboById) => {
    return cloneJSON(metadata.categoryCombos.find((item => item.id === attributeComboById)))
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

export const getAttributeOptionComboIdExistInWorkflow = ( metadata, workflow, attributeOptionComboId, orgUnit, period, calendar) => {
    const dataSets = JSON.parse(JSON.stringify(workflow.dataSets));
    
    const periodStartDate = period.startDate
    const periodEndDate = period.endDate
    
    if( dataSets.length > 0 ) {
        for( const dataSet of dataSets) {
            const categoryCombo = getAttributeComboById(metadata, dataSet.categoryCombo.id)
            const foundAttrOptionCombo = categoryCombo.categoryOptionCombos.find((optionCombo => optionCombo.id === attributeOptionComboId))
            if(foundAttrOptionCombo) {
                const foundCategoryOptions = foundAttrOptionCombo.categoryOptions.filter(categoryOption =>
                    isOptionAssignedToOrgUnit({ categoryOption, orgUnit }) &&
                    isOptionWithinPeriod({ periodStartDate, periodEndDate, categoryOption, calendar })
                );
                
                if (foundCategoryOptions.length > 0) {
                    return foundAttrOptionCombo;
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

export const filterDataSetsByAttributeOptionComboAndOrgUnit = (metadata, workflow, orgUnit, attributeOptionCombo) => {
    const result = [];
    
    if( attributeOptionCombo ) {
        const dataSets = cloneJSON(workflow?.dataSets)
        for( const dataSet of dataSets ) {
            const catCombo = getAttributeComboById(metadata, dataSet.categoryCombo.id)
            // Check if the data set assigned to "attributeOptionCombo"
            const checkAttrOptionCombo = catCombo.categoryOptionCombos.find((dsCatOptionCombo => dsCatOptionCombo.id === attributeOptionCombo.id))
            // Check if the data set assigned to "orgUnit"
            const checkOrgunit = dataSet.organisationUnits.find((dsOrgUnit => dsOrgUnit.id === orgUnit.id))
            if( checkAttrOptionCombo && checkOrgunit ) {
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
const verifyCategoryComboAssignment = (metadata, dataSet) => {
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


export const isOptionAssignedToOrgUnit = ({ categoryOption, orgUnit }) => {
    // by default, ...
    if (!categoryOption?.organisationUnits?.length) {
        return true;
    }
    
    const found = categoryOption?.organisationUnits.filter(catOptionOrgUnit => orgUnit?.path.indexOf(catOptionOrgUnit.id)>=0)
    
    return found.length > 0
}

export const isOptionWithinPeriod = ({
    periodStartDate,
    periodEndDate,
    categoryOption,
    calendar = 'gregory',
}) => {
    
    const categoryOptionStartDate = categoryOption.startDate
    const categoryOptionEndDate = categoryOption.endDate
    
    // option has not start and end dates
    if (!categoryOption.startDate && !categoryOption.endDate) {
        return true
    }
    
    let startDateValid = true
    let endDateValid = true 
    
    // catOption.startDate <= period.startDate
    if(categoryOption.startDate) {
        startDateValid = isDateALessThanDateB(
                { date: categoryOptionStartDate, calendar: 'gregory' },
                { date: periodStartDate, calendar },
                {
                    calendar,
                    inclusive: true,
                }
            )
    }
    
    // period.endDate<=catOption.endDate
    if(categoryOption.endDate) {
        endDateValid =  isDateALessThanDateB(
            { date: periodEndDate, calendar },
            { date: categoryOptionEndDate, calendar: 'gregory' },
            {
                calendar,
                inclusive: true,
            }
        )
    }
    
    return startDateValid && endDateValid

    // dates are all server dates so we can ignore time zone adjustment
    // use string comparison for time being to better handle non-gregory dates
    // date comparison

    // if (categoryOption.startDate) {
    //     const categoryOptionStartDate = categoryOption.startDate
    //     if (
    //         // date comparison (periodStartDate: system calendar, categoryOptionStartDate: ISO)
    //         // check if the the selected "period"'s startDate less then "categoryOption"'s startDate
    //         //  ==> return the "categoryOption" is invalid
    //         isDateALessThanDateB(
    //             { date: periodStartDate, calendar },
    //             { date: categoryOptionStartDate, calendar: 'gregory' },
    //             {
    //                 calendar,
    //                 inclusive: false,
    //             }
    //         )
    //     ) {
    //         // option start date is after period start date
    //         return false
    //     }
    // }

    // if (categoryOption.endDate) {
    //     const categoryOptionEndDate = categoryOption.endDate
    //     // date comparison (periodEndDate: system calendar, categoryOptionEndDate: ISO)
    //     // check if the the selected "period"'s endDate greater then "categoryOption"'s endDate
    //     // ==> return the "categoryOption" is invalid
    //     if (
    //         isDateAGreaterThanDateB(
    //             { date: periodEndDate, calendar },
    //             { date: categoryOptionEndDate, calendar: 'gregory' },
    //             {
    //                 calendar,
    //                 inclusive: false,
    //             }
    //         )
    //     ) {
    //         // option end date is before period end date
    //         return false
    //     }
    // }

    // // option spans over entire period
    // return true
}

/**
 * 
 * @param {*} attributeCombo 
 * @param {*} categoryOptionMap {<category_id>: <category_option_id>, ...}
 * @returns 
 */
export const findAttributeOptionCombo = (attributeCombo, categoryOptionMap) => {
    const selectedCatOptionIds = Object.values(categoryOptionMap) // Get the category list
    const catOptionComboList = attributeCombo.categoryOptionCombos
    for( let i=0; i<catOptionComboList.length; i++ ) {
        const attributeOptionCombo = catOptionComboList[i]
        const catOptionIds = attributeOptionCombo.categoryOptions.map((item) => item.id)
        if( areListsEqual(selectedCatOptionIds, catOptionIds) ) {
            return attributeOptionCombo;
        }
    }
    
    return;
}