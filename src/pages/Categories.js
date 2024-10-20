import React, { useState, useEffect } from 'react';
import { Button, Col, Input, Row, Space, Table } from 'antd';
import { AppstoreAddOutlined, SyncOutlined } from '@ant-design/icons';
import { find } from 'lodash';
// import { useNavigate } from 'react-router-dom';

import categoriesServices from '../services/CategoriesServices.js';

import { Wrapper } from '../styled-components/Wrapper';

import { customNot } from '../utils/Notifications';
import { filterData } from '../utils/Filters';
import { columnActionsDef, columnDef } from '../utils/ColumnsDefinitions';
import CategoryForm from '../components/CategoryForm.js';

const { Search } = Input;

function Categories() {
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');

  const [openForm, setOpenForm] = useState(false);
  const [formUpdateMode, setFormUpdateMode] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [entityToUpdate, setEntityToUpdate] = useState({});

  // const navigate = useNavigate();

  async function loadData() {
    setFetching(true);
    try {
      const response = await categoriesServices.find();
      setEntityData(response.data);
    } catch(error) {
      console.error(error);
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    columnDef({title: 'Id', dataKey: 'id'}),
    columnDef({title: 'Nombres', dataKey: 'name'}),
    columnActionsDef(
      {
        title: 'Acciones',
        dataKey: 'id',
        detailAction: (value) => customNot('info', 'En desarrollo', 'Próximamente'),
        editAction: (value) => {
          setOpenForm(true);
          setFormUpdateMode(true);
          setEntityToUpdate(find(entityData, ['id', value]));
        },
      }
    ),
  ];

  return (
    <Wrapper>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Search
            name={'filter'}
            value={filter} 
            placeholder="PLASTICOS" 
            allowClear 
            style={{ width: 300 }}
            onChange={(e) => setFilter(e.target.value)}
            size={'large'}
          />
          <Space>
            <Button
              size='large'
              type='primary'
              icon={<AppstoreAddOutlined />}
              onClick={() => {
                setEntityToUpdate({});
                setOpenForm(true);
              }}
              loading={fetching}
            >
              Nueva categoria
            </Button>
            <Button
              size='large'
              icon={<SyncOutlined />}
              onClick={() => {
                loadData();
              }}
              loading={fetching}
            >
              Actualizar
            </Button>
          </Space>
        </Col>
        <Col span={24}>
          <Table 
            size='small'
            style={{ width: '100%' }}
            rowKey={'id'}
            dataSource={filterData(entityData, filter, ['name']) || []}
            columns={columns} 
          />
        </Col>
      </Row>
      <CategoryForm 
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

export default Categories;
