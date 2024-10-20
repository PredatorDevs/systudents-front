import React, { useState, useEffect } from 'react';
import { Wrapper } from '../styled-components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import usersService from '../services/UsersService';
import { Button, Col, DatePicker, List, Row, Space } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';

moment.updateLocale('es-mx', { week: { dow: 1 }});

function UserActionLogs() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [fetching, setFetching] = useState();
  const [monthFilter, setMonthFilter] = useState(defaultDate());
  const [actionsData, setActionsData] = useState([]);

  function defaultDate() {
    return moment();
  };

  async function loadData() {
    setFetching(true);
    try {
      const res = await usersService.getActionLogs(monthFilter.format('YYYY-MM'));

      setActionsData(res.data);
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
                navigate('/main/administration/users');
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
          </Space>
        </Col>
        <Col span={6}>
          <DatePicker 
            locale={locale}
            allowClear={false}
            format="MMMM-YYYY"
            picker='month'
            value={monthFilter}
            style={{ width: '100%' }}
            onChange={(datetimeMoment, datetimeString) => {
              setMonthFilter(datetimeMoment);
            }}
          />
        </Col>
        <Col span={6}>
          <Button
            icon={<SearchOutlined />}
            onClick={() => {
              loadData();
            }}
            loading={fetching}
          >
            Buscar
          </Button>
        </Col>
        <Col span={24}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Registro de Actividad</p>
        </Col>
        <Col span={24}>
          <List
            key={'actionId'}
            itemLayout="horizontal"
            dataSource={actionsData}
            bordered
            size='small'
            renderItem={item => (
              <List.Item>
                <Row gutter={[0]} style={{ width: '100%' }}>
                  <Col span={24}>
                    <p style={{ margin: 0, color: '#262626', fontSize: 14 }}>{item.action}</p>
                  </Col>
                  <Col span={24}>
                    <p style={{ margin: 0, color: '#595959', fontSize: 12, fontStyle: 'italic' }}>{`${item.origin} - ${item.fullName}`}</p>
                  </Col>
                  <Col span={24}>
                    <p style={{ margin: 0, color: '#8c8c8c', fontSize: 12 }}>{item.actionDatetimeLabel}</p>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </Wrapper>
  );
}

export default UserActionLogs;
