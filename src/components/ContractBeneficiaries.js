import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Modal, Space, Tag, Row, Col, Radio, InputNumber } from 'antd';
import { BuildOutlined, DeleteFilled, DeleteOutlined,  EnvironmentOutlined,  HomeOutlined,  InboxOutlined,  ManOutlined,  PhoneOutlined,  PlusOutlined,  SaveOutlined, UserOutlined, WarningOutlined, WomanOutlined } from '@ant-design/icons';
import { find, isEmpty, toUpper } from 'lodash';

import { customNot } from '../utils/Notifications';
import { onKeyDownFocusTo } from '../utils/OnEvents';
import generalsServices from '../services/GeneralsServices';
import { validateNumberData, validateSelectedData, validateStringData } from '../utils/ValidateData';

const { Option } = Select;

function ContractBeneficiaries(props) {
  // const [fetching, setFetching] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [relationshipsData, setRelationshipsData] = useState([]);

  const [formContractBeneficiaries, setFormContractBeneficiaries] = useState([]);

  const [formBeneficiaryFullname, setFormBeneficiaryFullname] = useState('');
  const [formBeneficiaryAge, setFormBeneficiaryAge] = useState(null);
  const [formBeneficiaryGender, setFormBeneficiaryGender] = useState('M');
  const [formBeneficiaryRelationshipSelected, setFormBeneficiaryRelationshipSelected] = useState(0);
  const [formBeneficiaryAddress, setFormBeneficiaryAddress] = useState('');

  const {
    updateMode,
    setResetState,
    dataToUpdate,
    onDataChange,
    elementSizes,
    focusToId
  } = props;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    restoreState();
  }, [ setResetState ]);

  async function loadData() {
    try {
      setFetching(true);
      
      const relRes = await generalsServices.findRelationships();
      setRelationshipsData(relRes.data);

      setFetching(false);
    } catch(e) {
      console.log(e);
      setFetching(false);
    }
  }

  useEffect(() => {
    onDataChange(formContractBeneficiaries);
  }, [ formContractBeneficiaries ]);

  function restoreState() {
    // setFetching(false);
    setFormContractBeneficiaries([]);
    setFormBeneficiaryFullname('');
    setFormBeneficiaryAge(null);
    setFormBeneficiaryGender('M');
    setFormBeneficiaryRelationshipSelected(0);
    setFormBeneficiaryAddress('');
  }

  function deleteDataElement(index) {
    Modal.confirm({
      title: '¿Desea eliminar este pariente?',
      centered: true,
      icon: <WarningOutlined />,
      content: `Será eliminado de la lista de parientes`,
      okText: 'Confirmar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        setFormContractBeneficiaries((prev) => prev.filter((element, prevIndex) => (prevIndex !== index)));
      },
      onCancel() {},
    });
  }

  console.log(formContractBeneficiaries);

  return (
    <Row gutter={8} style={{ padding: '10px 5px' }}>
      <Col span={24}>
        <p style={{ margin: '0px', textAlign: 'center', fontWeight: 600, fontStyle: 'italic' }}>Beneficiarios</p>
      </Col>
      <Col span={12}>
        <p style={{ margin: '0px' }}>Nombre de beneficiario:</p>
        <Input 
          id={'g-contract-beneficiary-fullname-input'}
          onFocus={() => document.getElementById('g-contract-beneficiary-fullname-input').select()}
          onChange={(e) => setFormBeneficiaryFullname(toUpper(e.target.value))} 
          name={'formBeneficiaryFullname'} 
          value={formBeneficiaryFullname} 
          size={elementSizes || 'middle'}
          placeholder={'Ray Carter'}
          // width={450}
          onKeyDown={(e) => onKeyDownFocusTo(e, 'g-contract-beneficiary-type-selector')}
          style={{ width: '100%' }}
        />
      </Col>
      <Col span={6}>
        <p style={{ margin: '0px' }}>Género:</p>
        <Radio.Group
          value={formBeneficiaryGender}
          optionType="button"
          onChange={(e) => {
            setFormBeneficiaryGender(e.target.value);
          }}
          size={'small'}
        >
          <Radio.Button
            value="M"
            style={{
              backgroundColor: formBeneficiaryGender === 'M' ? '#1677ff' : 'transparent',
              color: formBeneficiaryGender === 'M' ? '#FFF' : '#000'
            }}
          >
            <Space><ManOutlined />Hombre</Space>
          </Radio.Button>
          <Radio.Button
            value="F"
            style={{
              backgroundColor: formBeneficiaryGender === 'F' ? '#eb2f96' : 'transparent',
              color: formBeneficiaryGender === 'F' ? '#FFF' : '#000'
            }}
          >
            <Space><WomanOutlined />Mujer</Space>
          </Radio.Button>
        </Radio.Group>
      </Col>
      
      <Col span={6}>
        <p style={{ margin: '0px' }}>Parentesco:</p>
        <Select
          id={'g-contract-beneficiary-type-selector'}
          showAction={'focus'}
          dropdownStyle={{ width: '100%' }} 
          style={{ width: '100%' }}
          value={formBeneficiaryRelationshipSelected}
          size={elementSizes || 'middle'}
          onChange={(value) => {
            setFormBeneficiaryRelationshipSelected(value);
            document.getElementById('g-contract-beneficiary-address-input').focus();
          }}
        >
          <Option value={0} disabled>Seleccione</Option>
          {
            (relationshipsData || []).map(
              (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
            )
          }
        </Select>
      </Col>
      <Col span={6}>
        <p style={{ margin: '0px' }}>Edad:</p>
        <InputNumber
          type={'number'}
          min={8}
          max={150}
          id={'g-contract-beneficiary-age-input'}
          onFocus={() => document.getElementById('g-contract-beneficiary-age-input').select()}
          onChange={(value) => setFormBeneficiaryAge(value)}
          name={'formBeneficiaryAge'}
          value={formBeneficiaryAge}
          placeholder={'18'}
          style={{ width: '100%' }}
          size={elementSizes || 'middle'}
          onKeyDown={(e) => onKeyDownFocusTo(e, 'g-contract-beneficiary-address-input')}
        />
      </Col>
      <Col span={12}>
        <p style={{ margin: '0px' }}>Dirección:</p>
        <Input
          id={'g-contract-beneficiary-address-input'}
          onFocus={() => document.getElementById('g-contract-beneficiary-address-input').select()}
          onChange={(e) => setFormBeneficiaryAddress(toUpper(e.target.value))}
          name={'formBeneficiaryAddress'}
          value={formBeneficiaryAddress}
          placeholder={'Av. Testa Ca. Edison 101'}
          style={{ width: '100%' }}
          size={elementSizes || 'middle'}
          onKeyDown={(e) => onKeyDownFocusTo(e, 'g-contract-beneficiary-add-button')}
        />
      </Col>
      <Col span={6} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
        <Button 
          id={'g-contract-beneficiary-add-button'}
          icon={<PlusOutlined />}
          size={elementSizes || 'middle'}
          type='primary'
          onClick={() => {
            if (
              validateStringData(formBeneficiaryFullname, 'Debe agregar un nombre de beneficiario')
              && validateSelectedData(formBeneficiaryRelationshipSelected, 'Debe agregar un parentesco')
              && validateStringData(formBeneficiaryAddress, 'Debe agregar una dirección de beneficiario')
              && validateNumberData(formBeneficiaryAge, 'Debe indicar la edad del beneficiario')
            ) {
              setFormContractBeneficiaries([
                ...formContractBeneficiaries,
                {
                  beneficiaryFullname: formBeneficiaryFullname,
                  beneficiaryRelationship: formBeneficiaryRelationshipSelected,
                  beneficiaryAddress: formBeneficiaryAddress,
                  beneficiaryAge: formBeneficiaryAge,
                  beneficiaryGender: formBeneficiaryGender
                }
              ]);
              setFormBeneficiaryFullname('');
              setFormBeneficiaryRelationshipSelected(0);
              setFormBeneficiaryAddress('');
              setFormBeneficiaryAge(null);
              setFormBeneficiaryGender('M');
              // let focusTo = document.getElementById(focusToId);
              // if (focusTo) focusTo.focus();
            }
          }}
          style={{ width: '100%' }}
        >
          Agregar
        </Button>
      </Col>
      <Col span={24}>
        <Space direction='vertical' style={{ marginTop: 10, width: '100%' }}>
        {
          formContractBeneficiaries.map((element, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#d3adf7',
                borderRadius: 5,
                padding: '5px 10px',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <Space direction='vertical'>
                <p style={{ margin: 0, color: '#531dab', fontWeight: 600 }}>
                  {`${element.beneficiaryFullname} (${element.beneficiaryAge} años)`}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#531dab' }}>
                  <EnvironmentOutlined /> {`${element.beneficiaryAddress}`}
                </p>
              </Space>
              <Space>
                {
                  element.beneficiaryGender === 'M' ? <Tag icon={<ManOutlined />} color={'blue'}>Hombre</Tag>
                  : element.beneficiaryGender === 'F' ? <Tag icon={<WomanOutlined />} color={'pink'}>Mujer</Tag> :
                  <></>
                }
                <Tag icon={<UserOutlined />} color="purple">
                  {find(relationshipsData, (x) => x.id === element.beneficiaryRelationship)?.name}
                </Tag>
                <Button 
                  // type={'primary'}
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

export default ContractBeneficiaries;
