import i18n from '@dhis2/d2-i18n'
import { Divider, SingleSelectField, SingleSelectOption} from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../app-context/use-app-context.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { findObject } from '../../utils/array-utils.js'
import { getCategoryComboByCategoryOptionCombo, getCategoryCombos } from '../../utils/caterogy-combo-utils.js'
import { ContextSelect } from '../context-select/context-select.js'
import css from './attribute-combo-select.module.css'
import CategoyOptionSelect from './category-option-select.js'


const CAT_OPTION_COMBO = 'CAT_OPTION_COMBO';

const AttributeComboSelect = () => {
    const { metadata } = useAppContext()
    const { workflow, orgUnit, period, openedSelect, setOpenedSelect, attributeOptionCombo, selectAttributeOptionCombo } = useSelectionContext();
        
    const open = openedSelect === CAT_OPTION_COMBO
    const value = attributeOptionCombo?.displayName
    const [categoryCombos, setCategoryCombos] = useState([])
    const [selectedCategoryCombo, setSelectedCategoryCombo] = useState(undefined)
    const [showed, setShowed] = useState(true)
    
    useEffect(() => {
        // Initilize Category Combo list
        const categoryComboList = getCategoryCombos(metadata, workflow)
        setCategoryCombos(categoryComboList)
        
        // Init Catecombo selected if any
        if( attributeOptionCombo ) {
            const initCatCombo = getCategoryComboByCategoryOptionCombo(metadata, attributeOptionCombo.id)
            setSelectedCategoryCombo( initCatCombo )
        }
        
        let isShowed = true
        if( categoryComboList.length === 0 ) {
            isShowed = false
        }
        else if( categoryComboList.length === 1 ) {
            const catCombo = categoryComboList[0]
            setSelectedCategoryCombo(catCombo)
            if( catCombo.categories.length === 1 ) {
                selectAttributeOptionCombo(catCombo.categoryOptionCombos[0])
                isShowed = false
            }
        }
        
        setShowed(isShowed)
       
    }, [workflow])
    
    const onChange = (catOptionCombo) => {
        selectAttributeOptionCombo(catOptionCombo)
    }
    
    const onChangeCatCombo = (catComboId) => {
        const catCombo = findObject(categoryCombos, "id", catComboId)
        setSelectedCategoryCombo(catCombo)
        if( catCombo.isDefault ) {
            selectAttributeOptionCombo(catCombo.categoryOptionCombos[0])
        }
    }
    
    return (
        <>
            {showed && <ContextSelect
                dataTest="category-combo-context-select"
                prefix={selectedCategoryCombo?.displayName || i18n.t('Category Option Combo')}
                placeholder={i18n.t('Choose a category option combo')}
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
                            selected={selectedCategoryCombo?.id}
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
                
                    {selectedCategoryCombo && (!selectedCategoryCombo.isDefault ) &&
                        <CategoyOptionSelect
                            key={`catCombo_${selectedCategoryCombo.id}`} 
                            categoryCombo={selectedCategoryCombo}
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