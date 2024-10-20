import React, { useState, useEffect } from 'react';
import { Button, Col, Dropdown, Input, Modal, Row, Select, Space, Table } from 'antd';
import { ClearOutlined, InteractionTwoTone, LeftOutlined, MenuOutlined, SyncOutlined, WarningOutlined } from '@ant-design/icons';

import productsServices from '../../services/ProductsServices.js';

import { Wrapper } from '../../styled-components/Wrapper.js';

import { filterData } from '../../utils/Filters.js';
import { columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../../utils/ColumnsDefinitions.js';
import categoriesServices from '../../services/CategoriesServices.js';
import brandsServices from '../../services/BrandsServices.js';
import { useNavigate } from 'react-router-dom';
import AuthorizeAction from '../../components/confirmations/AuthorizeAction.js';

const { Search } = Input;
const { Option } = Select;

function ProductsDeactivated() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');
  const [openReactivateAuthConfirm, setOpenReactivateAuthConfirm] = useState(false);

  const [productIdToReactivate, setProductIdToReactivate] = useState(0);

  const [categoriesData, setCategoriesData] = useState([]);
  const [categorySelectedId, setCategorySelectedId] = useState(0);

  const [brandsData, setBrandsData] = useState([]);
  const [brandSelectedId, setBrandSelectedId] = useState(0);

  const [entityData, setEntityData] = useState([]);

  async function loadData(locationId) {
    setFetching(true);
    try {
      const response = await productsServices.findDeactivated();
      setEntityData(response.data);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function loadGenData() {
    setFetching(true);
    try {
      const catRes = await categoriesServices.find();
      const brandRes = await brandsServices.find();

      setCategoriesData(catRes.data);
      setBrandsData(brandRes.data);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
    loadGenData();
  }, []);

  function reactivateAction(idToRemove) {
    Modal.confirm({
      title: '¿Desea habilitar este producto?',
      centered: true,
      icon: <WarningOutlined />,
      content: `Será añadido de la lista de productos activos`,
      okText: 'Confirmar',
      okType: 'primary',
      cancelText: 'Cancelar',
      async onOk() {
        setFetching(true);
        try {
          await productsServices.reactivate(idToRemove);
          setProductIdToReactivate(0);
          loadData();
        } catch(error) {

        }
        setFetching(false);
      },
      onCancel() {},
    });
  }

  const columns = [
    columnDef({title: 'Id', dataKey: 'productId', fSize: 11}),
    columnDef({title: 'Cod', dataKey: 'productCode', fSize: 11}),
    columnIfValueEqualsTo({title: '', dataKey: 'productIsService', text: 'Servicio', valueToCompare: 1, color: 'blue'}),
    columnDef({title: 'Nombre', dataKey: 'productName', fSize: 11}),
    columnDef({title: 'Categoria', dataKey: 'productCategoryName', fSize: 11}),
    columnDef({title: 'Marca', dataKey: 'productBrandName', fSize: 11}),
    columnDef({title: 'Medida Min.', dataKey: 'productMeasurementUnitName', fSize: 11}),
    columnMoneyDef({title: 'Costo', dataKey: 'productCost', fSize: 11}),
    columnMoneyDef({title: 'Costo + IVA', dataKey: 'productTotalCost', fSize: 11}),
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Acciones'}</p>,
      dataIndex: 'productId',
      key: 'productId',
      align: 'right',
      render: (text, record, index) => {
        return (
          <Dropdown
            menu={{
              items: [
                {
                  label: 'Habilitar',
                  key: '4',
                  icon: <InteractionTwoTone twoToneColor={'#13c2c2'} />,
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    setOpenReactivateAuthConfirm(true);
                    setProductIdToReactivate(record.productId);
                  }
                },
              ]
            }}
            placement="bottomLeft"
          >
            <Button icon={<MenuOutlined />} size={'small'} onClick={(e) => {e.stopPropagation()}} />
          </Dropdown>
        )
      }
    },
  ];

  function filterByFilters(x) {
    return (
      ((x.productCategoryId === categorySelectedId) || categorySelectedId === 0)
      && ((x.productBrandId === brandSelectedId) || brandSelectedId === 0)
    )
  }

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <Button
              icon={<LeftOutlined />} 
              onClick={(e) => {
                navigate('/main/inventory/products');
              }} 
              loading={fetching}
            >
              Regresar
            </Button>
            <Button 
              icon={<ClearOutlined />} 
              onClick={(e) => {
                setFilter('');
                setCategorySelectedId(0);
                setBrandSelectedId(0);
              }} 
              loading={fetching}
            >
              Limpiar filtros
            </Button>
            <Button 
              icon={<SyncOutlined />} 
              onClick={(e) => loadData()} 
              loading={fetching}
            >
              Actualizar
            </Button>
          </Space>
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Nombre:</p>
          <Search
            name={'filter'} 
            value={filter} 
            placeholder="Producto 1" 
            allowClear 
            style={{ width: 300 }}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Categoría:</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={categorySelectedId} 
            onChange={(value) => setCategorySelectedId(value)}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0}>{'TODAS'}</Option>
            {
              (categoriesData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Marca:</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={brandSelectedId} 
            onChange={(value) => setBrandSelectedId(value)}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0}>{'TODAS'}</Option>
            {
              (brandsData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={24} style={{ overflowX: 'scroll' }}>
          <Table 
            size='small'
            style={{ width: '100%' }}
            rowKey={'productId'}
            loading={fetching}
            dataSource={
              filterData(
                entityData.filter(filterByFilters),
                filter,
                [
                  'productId',
                  'productName',
                  'productCode',
                  'productBarcode',
                  'productBrandName',
                  'productCategoryName',
                  'productUbicationName'
                ]
              ) || []
            }
            columns={columns}
          />
        </Col>
      </Row>
      <AuthorizeAction
        open={openReactivateAuthConfirm}
        allowedRoles={[1, 2, 6]}
        title={`Autorizar Reactivar Item a Lista Activa`}
        confirmButtonText={'Confirmar Reactivar Producto'}
        actionType={'Reactivar item a la lista de inventario activo'}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized && successAuth) {
            // const { userId } = userAuthorizer;
            reactivateAction(productIdToReactivate);
          }
          setOpenReactivateAuthConfirm(false);
        }}
      />
    </Wrapper>
  );
}

export default ProductsDeactivated;
