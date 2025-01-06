import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useSelectionContext } from '../../selection-context/index.js'
import {
    getFixedPeriodsForTypeAndDateRange,
    RetryButton,
} from '../../shared/index.js'
import styles from './display.module.css'
import { TableCustomDataSet } from './table-custom-data-set.js'
import { Table } from './table.js'
import { getDataSetsInWorkflowByCategoryOptionCombo } from '../../utils/caterogy-combo-utils.js'

const query = {
    dataValueSets: {
        resource: 'dataValueSets',
        params: ({ periodIds, dataSetId, orgUnit, categoryOptionCombo }) => ({
            // // arrays are being handled by the app runtime
            period: periodIds,
            dataSet: dataSetId,
            orgUnit: orgUnit.id,
            attributeOptionCombo: categoryOptionCombo.id
        }),
    },
}

const Display = ({ dataSetId }) => {
    const selection = useSelectionContext()
    const { orgUnit, workflow, period, categoryOptionCombo } = selection
    const dataSets = getDataSetsInWorkflowByCategoryOptionCombo(workflow, categoryOptionCombo)
    const selectedDataSet = dataSets.find(({ id }) => id === dataSetId)
    const periodIds = selectedDataSet
        ? getFixedPeriodsForTypeAndDateRange(
              selectedDataSet.periodType,
              period.startDate,
              period.endDate
          ).map(({ id }) => id)
        : []

    const { called, fetching, data, error, refetch } = useDataQuery(query, {
        lazy: true,
    })
    const dataValues = data?.dataValueSets.dataValues;
    const fetchDataValues = () => refetch({periodIds, dataSetId, orgUnit, categoryOptionCombo})

    useEffect(
        () => {
            if (periodIds.length && dataSetId) {
                fetchDataValues();
            }
        },
        // joining so this produces a primitive value
        [periodIds.join(','), dataSetId]
    )
    
    if (!dataSets || dataSets.length === 0) {
        return (
            <div className={styles.noData}>
                <p>{i18n.t('This workflow does not contain any data sets.')}</p>
            </div>
        )
    }

    if (!dataSetId) {
        return (
            <div className={styles.chooseDataSet}>
                <h2>{i18n.t('Choose a data set to review')}</h2>
                <p>
                    {i18n.t(
                        '{{- workflowName}} has multiple data sets. Choose a data set from the tabs above.',
                        { workflowName: workflow.displayName }
                    )}
                </p>
            </div>
        )
    }

    if ((!called && periodIds.length) || fetching) {
        return (
            <div className={styles.display}>
                <div className={styles.loadingWrapper}>
                    <CircularLoader small />
                    {i18n.t('Loading data set')}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.display}>
                <NoticeBox
                    error
                    title={i18n.t(
                        'There was a problem displaying this data set'
                    )}
                >
                    <p>
                        {i18n.t(
                            `This data set couldn't be loaded or displayed. Try again, or contact your system administrator.`
                        )}
                    </p>
                    <RetryButton onClick={fetchDataValues}>
                        {i18n.t('Retry loading data set')}
                    </RetryButton>
                </NoticeBox>
            </div>
        )
    }

    if (!periodIds.length || !dataValues.length) {
        return (
            <div className={styles.noData}>
                <p>
                    {i18n.t(
                        `This data set doesn't have any data for {{- period}} in {{- orgUnit}} and {{- categoryOptionCombo}}.`,
                        {
                            period: period.displayName,
                            orgUnit: orgUnit.displayName,
                            categoryOptionCombo: categoryOptionCombo.displayName
                        }
                    )}
                </p>
            </div>
        )
    }
    
    const flatDataValues = () => {
        const results = [];
        for( var i=0; i<dataValues.length; i++ ) {
            const dataValue = dataValues[0];
            const dataSetElements = selectedDataSet.dataSetElements.filter((item => item.dataElement.id === dataValue.dataElement))
            if( dataSetElements.length > 0 ) {
                results.push([dataSetElements[0].dataElement.displayName, dataValue.value])
            }
        }
        
        return results;
    }
    
    if (selectedDataSet.formType === 'CUSTOM') {
        return (
            <div className={styles.display}>
                {/* {tables.map((table) => ( */}
                    <TableCustomDataSet
                        key={`${selectedDataSet.id} - ${categoryOptionCombo.id}`}
                        title={`${selectedDataSet.displayName} - ${categoryOptionCombo.displayName}`}
                        columns={[i18n.t("Data Element"), i18n.t("Value")]}
                        rows={flatDataValues()}
                    />
                {/* ))} */}
            </div>
        )
        
        // return (
        //     <div className={styles.display}>
        //         {/* {tables.map((table) => ( */}
        //             <TableCustomDataSet
        //                 // key={selectedDataSet.id}
        //                 dataSet={selectedDataSet}
        //                 dataValues={tables}
        //                 categoryOptionCombo={categoryOptionCombo}
        //                 // title={selectedDataSet.displayName}
        //                 // columns={selectedDataSet.dataSetElements.map((item) => item.dataElement)}
        //                 // rows={tables}
        //             />
        //         {/* ))} */}
        //     </div>
        // )
    }
    return (
        <div className={styles.display}>
        {/* {tables.map((table) => ( */}
            <Table
                key={`${selectedDataSet.id} - ${categoryOptionCombo.id}`}
                title={`${selectedDataSet.displayName} - ${categoryOptionCombo.displayName}`}
                columns={[i18n.t("Data Element"), i18n.t("Value")]}
                rows={flatDataValues()}
            />
        {/* ))} */}
    </div>
    
        // <div className={styles.display}>
        //     {/* {tables.map((table) => (
        //         <Table
        //             key={table.title}
        //             title={table.title}
        //             columns={table.headers.map((h) => h.name)}
        //             rows={table.rows}
        //         />
        //     ))} */}
        //     <Table
        //              dataSet={selectedDataSet}
        //              dataValues={tables}
        //         />
        // </div>
    )
}

Display.propTypes = {
    dataSetId: PropTypes.string,
}

export { Display }
