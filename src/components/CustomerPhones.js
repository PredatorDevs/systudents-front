import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Modal, Space, Tag, Row, Col } from 'antd';
import { BuildOutlined, DeleteFilled, DeleteOutlined,  HomeOutlined,  InboxOutlined,  PhoneOutlined,  PlusOutlined,  SaveOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';

import { customNot } from '../utils/Notifications';
import { validatePhoneNumber } from '../utils/ValidateData';
import { onKeyDownFocusTo } from '../utils/OnEvents';
import { RequiredQuestionMark } from './RequiredQuestionMark';

const { Option } = Select;

function CustomerPhones(props) {
  const [fetching, setFetching] = useState(false);

  const [formCustomerPhones, setFormCustomerPhones] = useState([]);

  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [formPhoneTypeSelected, setFormPhoneTypeSelected] = useState(1);

  const {
    label,
    setResetState,
    onDataChange,
    elementSizes,
    focusToId,
    requiredField
  } = props;

  useEffect(() => {
    restoreState();
  }, [ setResetState ]);

  useEffect(() => {
    onDataChange(formCustomerPhones);
  }, [ formCustomerPhones ]);

  function restoreState() {
    setFetching(false);
    setFormCustomerPhones([]);
    setFormPhoneNumber('');
    setFormPhoneTypeSelected(1);
  }

  function deleteDataElement(index) {
    Modal.confirm({
      title: '¿Desea eliminar este número de teléfono?',
      centered: true,
      icon: <WarningOutlined />,
      content: `Será eliminado de la lista de teléfonos`,
      okText: 'Confirmar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() { setFormCustomerPhones((prev) => prev.filter((element, prevIndex) => (prevIndex !== index))); },
      onCancel() {},
    });
  }

  function renderPhoneTag(type) {
    switch(type) {
      case 1: return (<Tag icon={<PhoneOutlined />} color="magenta">Celular</Tag>);
      case 2: return (<Tag icon={<HomeOutlined />} color="volcano">Casa</Tag>);
      case 3: return (<Tag icon={<BuildOutlined />} color="green">Trabajo</Tag>);
      case 4: return (<Tag icon={<InboxOutlined />} color="cyan">Fax</Tag>);
      default: return (<Tag icon={<PhoneOutlined />} color="magenta">Celular</Tag>);
    }
  }

  return (
    <Row gutter={[8, 8]}>
      <Col span={12}>
        <p style={{ margin: '0px' }}>{`${label || 'Teléfonos:'}`} {requiredField ? <RequiredQuestionMark /> : <></>}</p>
        <Input 
          id={'g-customer-phone-input'}
          onChange={(e) => setFormPhoneNumber(e.target.value)} 
          onFocus={() => document.getElementById('g-customer-phone-input').select()}
          name={'formPhoneNumber'} 
          value={formPhoneNumber} 
          placeholder={'2666-0000'}
          width={'100%'}
          size={elementSizes || 'middle'}
          onKeyDown={(e) => onKeyDownFocusTo(e, 'g-customer-phone-type-selector')}
        />
      </Col>
      <Col span={6}>
        <p style={{ margin: '0px' }}>{`-`}</p>
        <Select
          id={'g-customer-phone-type-selector'}
          dropdownStyle={{ width: '100%' }} 
          showAction={'focus'}
          style={{ width: '100%' }}
          value={formPhoneTypeSelected}
          onChange={(value) => {
            setFormPhoneTypeSelected(value);
            document.getElementById('g-customer-add-phone-button').focus();
          }}
          onKeyDown={(e) => onKeyDownFocusTo(e, 'g-customer-add-phone-button')}
          size={elementSizes || 'middle'}
        >
          <Option value={1}>Celular</Option>
          <Option value={2}>Casa</Option>
          <Option value={3}>Trabajo</Option>
          <Option value={4}>Fax</Option>
        </Select>
      </Col>
      <Col span={6}>
        <p style={{ margin: '0px' }}>{`-`}</p>
        <Button 
          id={'g-customer-add-phone-button'}
          icon={<SaveOutlined />}
          type='primary'
          size={elementSizes || 'middle'}
          onClick={() => {
            if (formPhoneNumber !== '') {
              if (validatePhoneNumber(formPhoneNumber, 'Introduzca un número de teléfono válido')) {
                setFormCustomerPhones([...formCustomerPhones, { phoneNumber: formPhoneNumber, phoneType: formPhoneTypeSelected }]);
                setFormPhoneNumber('');  
                let focusTo = document.getElementById(focusToId);
                if (focusTo) focusTo.focus();
              }
            }
            else {
              customNot('warning', 'Especifique número de teléfono', 'Para añadir debe especificar un valor');
            }}
          }
        >Agregar</Button>
      </Col>
      {
        isEmpty(formCustomerPhones) ? <Col span={24}>
          <p style={{ margin: '0px', fontSize: 10 }}>{`Debe tener al menos un teléfono a la lista y es posible añadir más de uno`}</p>
        </Col> : <></>
      }
      <Col span={12}>
        <Space direction='vertical' style={{ marginTop: 10, width: '100%' }}>
        {
          formCustomerPhones.map((element, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f6ffed',
                borderRadius: 5,
                border: '1px solid #95de64',
                padding: '5px 10px',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <p style={{ margin: 0 }}>
                {element.phoneNumber}
              </p>
              <Space>
                {
                  renderPhoneTag(element.phoneType)
                }
                <Button 
                  // type={'primary'}
                  // size={'small'}
                  size={elementSizes || 'middle'}
                  danger
                  icon={<DeleteFilled />} 
                  onClick={(e) => deleteDataElement(index)}
                />
              </Space>
            </div>
          ))
        }
        </Space>
      </Col>
    </Row>
  )
}

export default CustomerPhones;
