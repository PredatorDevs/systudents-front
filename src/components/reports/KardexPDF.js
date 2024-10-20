import { Col, Row, Table } from "antd";
import React, { useEffect } from "react";
import { TicketWrapper } from "../../styled-components/TicketWrapper";
import { Document, Page, View, Text  } from '@react-pdf/renderer';

import moment from 'moment';
import 'moment/locale/es-mx';
import { isEmpty } from "lodash";
import { getUserLocationName } from "../../utils/LocalData";

function KardexPDF(props) {

  const { reportData, rangeDate, productSelectedName } = props;

  function renderHeader() {
    return (
      <View 
        style={{ marginBottom: 5, display: 'flex', flexDirection: 'row-reverse' }}
        fixed
      >
        <Text style={{ textAlign: 'left', fontSize: 7, color: '#8c8c8c' }}>
          {`Lácteos Nueva Guinea`}
        </Text>
      </View>
    )
  }

  function renderFooter() {
    return (
      <View 
        style={{
          marginTop: 5,
          display: 'flex',
          flexDirection: 'row-reverse'
        }}
        fixed
        render={({ pageNumber }) => (
          <Text
            style={{ textAlign: 'left', fontSize: 7, color: '#8c8c8c' }}
          >
            {`Generado el: ${moment().format('LL')} a las ${moment().format('LT')} - Página ${pageNumber}`}
          </Text>
      )} />
    )
  }

  function renderKardexHeader() {
    return (
      <View 
        style={{
          margin: '2px 0px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderBottom: '1px solid black',
          borderStyle: 'dashed',
          backgroundColor: '#f5f5f5'
        }}
        fixed
      >
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`Corr.`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`Fecha`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`N° Doc.`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '12.48%' }}>
          {`Proveedor/Cliente`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`Nacionalidad`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
          {`Inicial`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`Unidades Compradas`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`Costo`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`Costo Total`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
          {`Total Unidades`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`Unidades Vendidas`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
          {`Precio Venta`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
          {`Venta Total`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
          {`Inventario Final`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
          {`Costo Unitario`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
          {`Costo Total`}
        </Text>
      </View>
    )
  }

  function renderKardexPreHeader() {
    return (
      <View 
        style={{
          margin: '2px 0px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          // borderBottom: '1px solid black',
          // borderStyle: 'dashed',
          backgroundColor: '#f5f5f5'
        }}
        fixed
      >
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '37.44%' }}>
          {``}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '20.80%' }}>
          {`Compras`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '16.64%' }}>
          {`Ventas`}
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '24.96%' }}>
          {``}
        </Text>
      </View>
    )
  }

  return (
    <Document>
      <Page size={'LEGAL'} style={{ padding: '20px 40px 20px 30px' }} orientation={'landscape'}>
        {/* {renderHeader()} */}
        <View 
          style={{
            marginTop: 5,
            display: 'flex',
            flexDirection: 'column'
          }}
          fixed
        >
          <Text style={{ fontSize: 11, color: '#000000' }}>{`Nombre de Contribuyente`}</Text>
          <Text style={{ fontSize: 9, color: '#000000' }}>{`NIT ****-******-***-*`}</Text>
          <Text style={{ fontSize: 9, color: '#000000', marginBottom: 5 }}>{`Registro No. ******-*`}</Text>
          <Text style={{ fontSize: 11, color: '#000000' }}>{`${productSelectedName || ''}`}</Text>
          <Text style={{ fontSize: 9, color: '#000000' }}>{`Reporte de Kardex`}</Text>
          <Text style={{ fontSize: 9, color: '#000000' }}>{`Período: ${rangeDate.initialDate || ''} al ${rangeDate.finalDate || ''}`}</Text>
        </View>
        {/* <Text style={{ fontSize: 10, color: '#000000', marginTop: 10, marginBottom: 5 }}>
          {`Movimientos`}
        </Text> */}
        {renderKardexPreHeader()}
        {renderKardexHeader()}
        {
          reportData.map((element, index) => {
            return (
              <View 
                key={index}
                style={{
                  margin: '2px 0px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
              >
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {`${index + 1}`}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {`${element.documentDatetimeFormatted}`}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {`${element.documentNumber || ''}`}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '12.48%' }}>
                  {`${element.documentConcept} - ${element.documentPerson || ''}`}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {`${element.documentNationality}`}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
                  {`${Number(element.initialBalance).toFixed(2) || 0.00}`}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {(element.documentType === 1) ? Number(element.documentProductQuantity).toFixed(2) : 0.00}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {(element.documentType === 1) ? Number(element.documentUnitValue).toFixed(2) : 0.00}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {(element.documentType === 1) ? ((Number(element.documentUnitValue)|| 0) * (Number(element.documentProductQuantity) || 0)).toFixed(2) : 0.00}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
                  {(element.documentType === 1) ? Number(element.documentProductQuantity).toFixed(2) : 0.00}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {(element.documentType === 2) ? Number(element.documentProductQuantity).toFixed(2) : 0.00}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '4.16%' }}>
                  {(element.documentType === 2) ? Number(element.documentUnitValue).toFixed(2) : 0.00}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
                  {(element.documentType === 2) ? ((Number(element.documentUnitValue)|| 0) * (Number(element.documentProductQuantity) || 0)).toFixed(2) : 0.00}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
                  {`${Number(element.lastBalance).toFixed(2) || 0.00}`}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
                  {`${Number(element.documentUnitCost).toFixed(2) || 0.00}`}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 7, color: '#000000', width: '8.32%' }}>
                  {((Number(element.lastBalance)|| 0) * (Number(element.documentUnitCost) || 0)).toFixed(2)}
                </Text>
              </View>
            )
          })
        }
        {/* {renderFooter()} */}
      </Page>
    </Document>
  )
}

export default KardexPDF;
