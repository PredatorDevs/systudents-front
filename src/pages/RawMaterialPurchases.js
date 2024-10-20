import { Col, Row, Card, Button, Statistic, Table, Space } from 'antd';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Wrapper } from '../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, DollarOutlined, LogoutOutlined, ShoppingCartOutlined, SyncOutlined } from '@ant-design/icons';
import { columnActionsDef, columnBoolean, columnDatetimeDef, columnDef, columnIfValueEqualsTo, columnMoneyDef, columnTag } from '../utils/ColumnsDefinitions';
import { customNot } from '../utils/Notifications';
import { forEach, isEmpty } from 'lodash';
import RawMaterialPurchasePreview from '../components/previews/RawMaterialPurchasePreview';
import rawMaterialPurchasesServices from '../services/RawMaterialPurchasesServices';

function RawMaterialPurchases() {
  const [fetching, setFetching] = useState(false);
  const [entityRefreshData, setEntityRefreshData] = useState(0);

  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [openPreview, setOpenPreview] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [purchaseResumeData, setPurchaseResumeData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setFetching(true);
    const response = await rawMaterialPurchasesServices.find()
    setEntityData(response.data);
    setFetching(false);
  };

  const columns = [
    columnDef({title: 'Código', dataKey: 'rawMaterialPurchaseId'}),
    columnDef({title: 'N° Doc', dataKey: 'documentNumber'}),
    columnDef({title: 'Sucursal', dataKey: 'locationName'}),
    columnDatetimeDef({title: 'Fecha', dataKey: 'documentDatetime', enableSort: true }),
    columnDef({title: 'Proveedor', dataKey: 'supplierName'}),
    columnDef({title: 'Tipo', dataKey: 'documentTypeName'}),
    columnDef({title: 'Pago', dataKey: 'paymentTypeName'}),
    columnTag({title: 'Para', dataKey: 'rawMaterialDistributionName', tagColor: '#2f54eb' }),
    columnMoneyDef({title: 'Total', dataKey: 'total'}),
    columnIfValueEqualsTo({title: '', dataKey: 'isVoided', valueToCompare: 1, text: 'Anulada'}),
    columnActionsDef(
      {
        title: 'Acciones',
        dataKey: 'rawMaterialPurchaseId',
        edit: false,
        detailAction: (value) => {
          setEntitySelectedId(value);
          setOpenPreview(true);
        },
      }
    ),
  ];

  function getPurchaseTotal(paymentType) {
    let total = 0;
    forEach(entityData, (value) => {
      if (value.paymentTypeId === paymentType)
        total += +value.total
    });
    return total || 0;
  }

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <Button 
              icon={<SyncOutlined />}
              onClick={() => loadData()}
              // size={'large'}
              >
              Actualizar
            </Button>
          </Space>
        </Col>
        <Col span={24} style={{ backgroundColor: '#FAFAFA' }}>
          <Space wrap>
            <Card style={{ margin: '10px 5px' }}>
              <Statistic title="Compras" value={entityData.length} prefix={<BookOutlined />} />
            </Card>
            <Card style={{ margin: '10px 5px' }}>
              <Statistic title="Total Contado" value={getPurchaseTotal(1)} precision={2} prefix={<DollarOutlined />} />
            </Card>
            <Card style={{ margin: '10px 5px' }}>
              <Statistic title="Total Crédito" value={getPurchaseTotal(2)} precision={2} prefix={<DollarOutlined />} />
            </Card>
          </Space>
        </Col>
        <Col span={24}>
          <Table
            loading={fetching}
            columns={columns}
            rowKey={'rawMaterialPurchaseId'}
            size={'small'}
            dataSource={entityData || []}
            onRow={(record, rowIndex) => {
              return {
                onClick: (e) => {
                  e.preventDefault();
                  setEntitySelectedId(record.rawMaterialPurchaseId);
                  setOpenPreview(true);
                }
              };
            }}
          />
        </Col>
      </Row>
      <RawMaterialPurchasePreview
        open={openPreview}
        rawMaterialPurchaseId={entitySelectedId}
        onClose={(wasVoided) => {
          setOpenPreview(false);
          if(wasVoided) loadData();
        }}
      />
    </Wrapper>
  );
}

export default RawMaterialPurchases;
