import React, { useState, useEffect } from 'react';
import { Col, Row, Button, PageHeader, Modal, Table, Result, Input, Tooltip, Switch } from 'antd';
import { CloseOutlined, SyncOutlined, WarningTwoTone } from '@ant-design/icons';
import { isEmpty } from 'lodash';

import { columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions.js';
import productsServices from '../../services/ProductsServices.js';
import { getUserLocation, getUserLocationName } from '../../utils/LocalData.js';
import { filterData } from '../../utils/Filters.js';

const { Search } = Input;

function LocationStockCheckPreview(props) {
  const [fetching, setFetching] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [filter, setFilter] = useState('');
  const [showProductsMinAlert, setShowProductMinAlert] = useState(false);

  const { open, onClose } = props;

  async function loadData() {
    setFetching(true);
    try {
      const stockRes = await productsServices.findLocationStockCheck(getUserLocation());
      setEntityData(stockRes.data);
    } catch (error) {
      console.log(error);
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function filterByFilters(x) {
    return (
      ((+x.stock <= +x.minStockAlert) || showProductsMinAlert === false)
    )
  }

  return (
    <Modal
      title={
        <PageHeader
          onBack={() => null}
          backIcon={null}
          title={`Existencias`}
          subTitle={`Productos en ${getUserLocationName()}`}
          style={{ padding: 0 }}
          extra={[
            <Button
              // type="primary"
              icon={<SyncOutlined />}
              onClick={() => {
                loadData();
              }}
            >
              Actualizar
            </Button>,
            <Button
              type="primary"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                onClose();
              }}
            />
          ]}
        />
      }
      centered
      bodyStyle={{ padding: 15 }}
      width={700}
      closeIcon={<></>}
      onCancel={() => onClose()}
      maskClosable={false}
      open={open}
      footer={null}
    >
      {
        isEmpty(entityData) ? <Result>
          <Result
            status="warning"
            title={<p style={{ color: '#FAAD14' }}>{fetching ? 'Cargando...' : 'No se pudo obtener información de las existencias'}</p>}
            extra={
              <Button
                type="primary"
                key="console"
                onClick={() => {
                  onClose();
                }}
              >
                Cerrar
              </Button>
            }
          />
        </Result> : <Row gutter={[8, 16]}>
          <Col span={24}>
            <Search
              name={'filter'}
              value={filter} 
              placeholder="" 
              allowClear 
              style={{ width: 300 }}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Col>
          <Col span={12}>
            <p style={{ margin: 0 }}>Mostrar existencias bajas:</p>
            <Switch
              checked={showProductsMinAlert}
              onChange={(checked) => {
                setShowProductMinAlert(checked);
              }}
              size='small'
            />
          </Col>
          <Col span={24}>
            <Table
              bordered
              size='small'
              columns={[
                columnDef({title: 'Descripcion', dataKey: 'productName', fSize: 10, enableSort: true }),
                columnDef({title: 'Cantidad', dataKey: 'stock', fSize: 11}),
                columnMoneyDef({title: 'Precio 1', dataKey: 'price1', fSize: 11}),
                columnMoneyDef({title: 'Precio 2', dataKey: 'price2', fSize: 11}),
                columnMoneyDef({title: 'Precio 3', dataKey: 'price3', fSize: 11}),
                columnMoneyDef({title: 'Costo', dataKey: 'productCost', fSize: 11}),
                columnMoneyDef({title: 'Costo + IVA', dataKey: 'productTotalCost', fSize: 11}),
                {
                  title: <p style={{ margin: '0px', fontSize: 12, fontWeight: 600 }}>{''}</p>,
                  dataIndex: 'productId',
                  key: 'productId',
                  align: 'right',
                  render: (text, record, index) => {
                    return (
                      <Tooltip placement="left" title={`Producto con existencias bajas`}>
                        <WarningTwoTone
                          twoToneColor={'red'}
                          style={{ display: record.stock <= record.minStockAlert ? 'inline' : 'none' }}
                        />
                      </Tooltip>
                    )
                  }
                },
              ]}
              rowKey={'productStockId'}
              dataSource={filterData(entityData.filter(filterByFilters), filter, ['productName']) || []}
              // pagination={false}
              // scroll={{ y: 300 }}
              loading={fetching}
            />
          </Col>
        </Row>
      }
    </Modal>
  )
}

export default LocationStockCheckPreview;
