import React, { useState, useEffect } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Row, Space, Table } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import productsServices from '../../services/ProductsServices';
import { columnDef } from '../../utils/ColumnsDefinitions';
import { includes } from 'lodash';
import { getUserRole } from '../../utils/LocalData';
import { customNot } from '../../utils/Notifications';
import ProductAdjustmentPreview from '../../components/previews/ProductAdjustmentPreview';

function ProductAdjustments() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [fetching, setFetching] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [openPreview, setOpenPreview] = useState(false);

  async function loadData() {
    setFetching(true);
    try {
      const res = await productsServices.stocks.adjustments.find();
      console.log(res.data);

      setEntityData(res.data);
    } catch(err) {
    
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (state !== null) {
      // APPLY LOGIC FROM NAVIGATION PROPS
    }
  }, []);

  return (
    <Wrapper>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                navigate('/main/inventory/products');
              }}
              loading={fetching}
            >
              Regresar
            </Button>
            <Button
              icon={<SyncOutlined />}
              onClick={() => {
                loadData();
              }}
              loading={fetching}
            >
              Actualizar
            </Button>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => {
                navigate('/main/inventory/products/adjustments/new');
              }}
              loading={fetching}
            >
              Nuevo Ajuste
            </Button>
          </Space>
        </Col>
        <Col span={24}>
          <Table 
            size='small'
            style={{ width: '100%' }}
            rowKey={'productId'}
            loading={fetching}
            dataSource={entityData || []}
            columns={[
              columnDef({title: 'Id', dataKey: 'productStockAdjustmentId', fSize: 11}),
              columnDef({title: 'Fecha', dataKey: 'adjustmentDatetimeLabel', fSize: 11}),
              columnDef({title: 'Comentarios', dataKey: 'comments', fSize: 11}),
              columnDef({title: 'Realizado por', dataKey: 'adjustmentByFullName', fSize: 11}),
              columnDef({title: 'Autorizado por', dataKey: 'authorizedByFullName', fSize: 11}),
            ]}
            onRow={(record, rowIndex) => {
              return {
                onClick: (e) => {
                  if (includes([1, 2], getUserRole())) {
                    setEntitySelectedId(record.productStockAdjustmentId);
                    setOpenPreview(true);
                    e.preventDefault();
                  } else {
                    customNot('warning', 'No tienes permitido realizar esta acción')
                  }
                }
              };
            }}
          />
        </Col>
      </Row>
      <ProductAdjustmentPreview
        open={openPreview}
        productStockAdjustmentId={entitySelectedId}
        onClose={() => {
          setOpenPreview(false);
        }}
      />
    </Wrapper>
  );
}

export default ProductAdjustments;
