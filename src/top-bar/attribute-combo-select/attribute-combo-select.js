import i18n from '@dhis2/d2-i18n'
import { Divider, SingleSelectField, SingleSelectOption} from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../app-context/use-app-context.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { cloneJSON, findObject } from '../../utils/array-utils.js'
import { getCategoryComboByCategoryOptionCombo, getCategoryCombos, getCategoryOptionsByCategoryOptionCombo } from '../../utils/caterogy-combo-utils.js'
import { ContextSelect } from '../context-select/context-select.js'
import css from './attribute-combo-select.module.css'
import CategoyOptionSelect from './category-option-select.js'


const CAT_OPTION_COMBO = 'CAT_OPTION_COMBO';

const AttributeComboSelect = () => {
    const { metadata } = useAppContext()
    const { workflow, orgUnit, period, openedSelect, setOpenedSelect, attributeOptionCombo, selectAttributeOptionCombo } = useSelectionContext();
        
    const open = openedSelect === CAT_OPTION_COMBO
    // const value = attributeOptionCombo?.displayName
    const [categoryCombos, setCategoryCombos] = useState([])
    const [value, setValue] = useState("")
    const [selectedAttributeCombo, setSelectedAttributeCombo] = useState(null)
    const [showed, setShowed] = useState(true)
    
    useEffect(() => {
        // Initilize Category Combo list
        const categoryComboList = getCategoryCombos(metadata, workflow)
        setCategoryCombos(categoryComboList)
        
        let isShowed = true
        let attrComboValue = i18n.t('0 selections')
        
        // Init Catecombo selected if any
        if( attributeOptionCombo ) {
            const initCatCombo = getCategoryComboByCategoryOptionCombo(metadata, attributeOptionCombo.id)
            /***
            Convert catOption list from 
                [{ id: "orbbKVMCHeW" }, { id: "orMsAWGkmbP" }] 
            to 
                {0: "orbbKVMCHeW", 1: "orMsAWGkmbP"} 
            */
            const catOptions = getCategoryOptionsByCategoryOptionCombo(metadata, attributeOptionCombo.id).reduce((acc, item, index) => {
                acc[index] = item.id;
                return acc;
              }, {});
              
            setSelectedAttributeCombo( initCatCombo )
            attrComboValue = getAttributeOptionComboValue(initCatCombo, catOptions)
        }
        else if( categoryComboList.length === 1 ) {
            const catCombo = categoryComboList[0]
            setSelectedAttributeCombo(catCombo)
            if( catCombo.categories.length === 1 ) {
                const categoryOptionCombo = catCombo.categoryOptionCombos[0]
                selectAttributeOptionCombo(categoryOptionCombo)
                attrComboValue = i18n.t('1 selection')
                isShowed = false
            }
        }
        else {
            if( categoryComboList.length === 0 ) {
                isShowed = false
            }
            setSelectedAttributeCombo(null)
        }
        
        // Update state only if values have changed
        setShowed((prev) => (prev !== isShowed ? isShowed : prev));
        setValue((prev) => (prev !== attrComboValue ? attrComboValue : prev));
    }, [workflow])
    
    const onChange = (selectedAttrCombo, selectedCategoryItems, selectedAttrOptionCombo) => {
        selectAttributeOptionCombo(selectedAttrOptionCombo)
        setValue(getAttributeOptionComboValue(selectedAttrCombo, selectedCategoryItems))
    }
    
    const getAttributeOptionComboValue = (selectedAttrCombo, selectedCategoryItems) => {
        if (selectedAttrCombo?.isDefault) {
            return ''
        }
        
        if (
            !Object.values(selectedCategoryItems).length ||
            !selectedAttrCombo
        ) {
            return i18n.t('0 selections')
        }
        
        if (selectedCategoryItems.length === 1) {
            const categoryId = selectedAttrCombo?.categories[0]
            const category = selectedAttrCombo.categories.find((item => item.id == categoryId))
            return category?.displayName
        }
    
        const amount = Object.values(selectedCategoryItems).length
    
        if (amount === 1) {
            return i18n.t('1 selection')
        }
    
        return i18n.t('{{amount}} selections', {
            amount: Object.values(selectedCategoryItems).length,
        })
    }
    
    const onChangeCatCombo = (catComboId) => {
        const catCombo = findObject(categoryCombos, "id", catComboId)
        setSelectedAttributeCombo(catCombo)
        setValue(i18n.t('0 selections'))
        if( catCombo.isDefault ) {
            selectAttributeOptionCombo(catCombo.categoryOptionCombos[0])
        }
    }
    
    return (
        <>
            {showed && <ContextSelect 
                dataTest="category-combo-context-select"
                prefix={selectedAttributeCombo?.displayName || i18n.t('Category Option Combo')}
                placeholder={value || i18n.t('Choose a category option combo')}
                value={value}
                open={open}
                disabled={!(workflow?.id && period?.id && orgUnit?.id )}
                onOpen={() => setOpenedSelect(CAT_OPTION_COMBO)}
                onClose={() => setOpenedSelect('')}
                // requiredValuesMessage={requiredValuesMessage}
                popoverMaxWidth={400}
            >
                {/* Renders a SingleSelectField for each category */}
                <div className={css.menu} style={{height: categoryCombos.length == 1 ? "250px" : "330px"}}>
                    {/* Only show Category Combo dropdown when there are more than one categoryCombo in the list */}
                    {categoryCombos.length > 1 && <>
                        <SingleSelectField
                            placeholder={i18n.t('Choose a combination')}
                            selected={selectedAttributeCombo?.id}
                            onChange={({selected}) => onChangeCatCombo(selected)}
                        >
                            {categoryCombos.map((catCombo) => (
                                <SingleSelectOption
                                    key={catCombo.id}
                                    value={catCombo.id}
                                    label={catCombo.displayName}
                                />
                            ))}
                        </SingleSelectField>
                        <Divider className={css.divider} />
                    </>}
                
                    {selectedAttributeCombo && (!selectedAttributeCombo.isDefault ) &&
                        <CategoyOptionSelect
                            key={`catCombo_${selectedAttributeCombo.id}`} 
                            categoryCombo={selectedAttributeCombo}
                            orgUnit={orgUnit}
                            selected={attributeOptionCombo}
                            onChange={onChange}
                            onClose={() => setOpenedSelect('')}
                        />}
                
                </div>
            </ContextSelect>}
        </>
    )
}

export { AttributeComboSelect, CAT_OPTION_COMBO }