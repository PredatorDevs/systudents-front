import React, { useState, useEffect } from 'react';
import { Button, Col, Input, PageHeader, Row, Select, Space, Spin, Table } from 'antd';
import { ClearOutlined, LogoutOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { find, includes } from 'lodash';
import { useNavigate } from 'react-router-dom';

import furnishingsServices from '../../services/FurnishingsServices.js';

import { Wrapper } from '../../styled-components/Wrapper.js';
import { TableContainer } from '../../styled-components/TableContainer.js';

import { customNot } from '../../utils/Notifications.js';
import { filterData } from '../../utils/Filters.js';
import { columnActionsDef, columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions.js';
import RawMaterialForm from '../../components/forms/RawMaterialForm.js';
import { getUserLocation, getUserRole } from '../../utils/LocalData.js';
import locationsService from '../../services/LocationsServices.js';
import FurnishingForm from '../../components/forms/FurnishingForm.js';

const { Search } = Input;
const { Option } = Select;

function Furnishings() {
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');

  const [locationsData, setLocationsData] = useState([]);
  const [locationSelectedId, setLocationSelectedId] = useState(getUserLocation());

  const [openForm, setOpenForm] = useState(false);
  const [formUpdateMode, setFormUpdateMode] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [entityRefreshData, setEntityRefreshData] = useState(0);
  const [entityToUpdate, setEntityToUpdate] = useState({});

  const navigate = useNavigate();

  async function loadData(locationId) {
    setFetching(true);
    try {
      const response = await furnishingsServices.findByLocationStockData(locationId);
      const locRes = await locationsService.find();
      setEntityData(response.data);
      setLocationsData(locRes.data);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData(locationSelectedId);
  }, []);

  const columns = [
    columnDef({title: 'Id', dataKey: 'id'}),
    columnDef({title: 'Nombre', dataKey: 'name'}),
    columnDef({title: 'Existencias', dataKey: 'currentLocationStock'}),
    columnMoneyDef({title: 'Costo', dataKey: 'cost'}),
    columnActionsDef(
      {
        title: 'Acciones',
        dataKey: 'id',
        detailAction: (value) => customNot('info', 'En desarrollo', 'Próximamente'),
        edit: includes([1, 2, 3, 4], getUserRole()),
        editAction: (value) => {
          setEntityToUpdate(find(entityData, ['id', value]));
          setOpenForm(true);
          setFormUpdateMode(true);
        },
      }
    ),
  ];

  return (
    <Wrapper>
      <Row gutter={[8, 8]} style={{ width: '100%' }}>
        <Col span={24}>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEntityToUpdate({});
                setOpenForm(true);
              }}
              loading={fetching}
            >
              Nuevo Mobiliario
            </Button>
            {/* <Button 
              icon={<ClearOutlined />} 
              onClick={(e) => {
                setFilter('');
                setCategorySelectedId(0);
                setBrandSelectedId(0);
              }} 
            >
              Limpiar filtros
            </Button> */}
            <Button 
              icon={<SyncOutlined />} 
              onClick={(e) => loadData(locationSelectedId)}
              loading={fetching}
            >
              Actualizar
            </Button>
          </Space>
        </Col>
        <Col span={6}>
          <p style={{ margin: 0 }}>Sucursal:</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={locationSelectedId} 
            onChange={(value) => {
              setLocationSelectedId(value);
              loadData(value);
            }}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0} disabled>{'Seleccione sucursal'}</Option>
            {
              (locationsData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
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
        <Col span={24}>
          <Table 
            size='small'
            style={{ width: '100%' }}
            rowKey={'id'}
            loading={fetching}
            dataSource={
              filterData(
                entityData,
                filter,
                [
                  'name'
                ]
              ) || []
            }
            columns={columns}
            onRow={(record, rowIndex) => {
              return {
                onClick: (e) => {
                  e.preventDefault();
                  setOpenForm(true);
                  setFormUpdateMode(true);
                  setEntityToUpdate(find(entityData, ['id', record?.id]));
                }
              };
            }}
          />
        </Col>
      </Row>
      <FurnishingForm
        open={openForm} 
        updateMode={formUpdateMode} 
        dataToUpdate={entityToUpdate} 
        onClose={(refresh) => { 
          setOpenForm(false);
          setFormUpdateMode(false);
          if (refresh) { 
            loadData();
          }
        }}
      />
    </Wrapper>
  );
}

export default Furnishings;
