import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Input, Alert, Modal } from 'antd';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleTwoTone,
  KeyOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Wrapper } from '../styled-components/Wrapper';
import { authenticateUser } from '../services/AuthServices';
import { customNot } from '../utils/Notifications';
import { getUserIsLoggedIn } from '../utils/LocalData';

import bg from '../img/backgrounds/landscape.jpg';

const Container = styled.div`
  align-items: center;
  /* background-image: url('../img/backgrounds/landscape.png'); */
  background-image: url(${bg});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  /* border: 1px solid #D1DCF0; */
  border-radius: 10px;
  box-shadow: 3px 3px 5px 0px #d9d9d9;
  -webkit-box-shadow: 3px 3px 5px 0px #d9d9d9;
  -moz-box-shadow: 3px 3px 5px 0px #d9d9d9;
  /* display: flex; */
  /* flex-direction: column; */
  /* padding: 20px; */
  width: 700px;
  overflow: hidden;
  p {
    color: #000;
    margin: 0px;
    text-align: center;
  }

  .title {
    color: #000;
    font-size: 20px;
    margin-bottom: 10px;
    text-align: center;
  }
  
  .label {
    font-size: 14px;
    margin: 10px 0px;
    width: 100%;
    text-align: left;
    text-align: center;
  }

  .copyright {
    font-size: 10px;
    margin: 20px 0px 0px 0px;
  }
`;

function Login() {
  const { state } = useLocation();

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openForcedCloseWarning, setOpenForcedCloseWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userNameInput = document.getElementById('g-login-username-input');
    if (userNameInput !== null) userNameInput.focus();
  }, []);

  useEffect(() => {
    try {
      if (state !== null) {
        const { forcedLogout } = state;
        if (forcedLogout) {
          setOpenForcedCloseWarning(true);
        }
      }
    } catch(error) {

    }
  }, []);

  function loginAction() {
    setLoadingBtn(true);
    authenticateUser(username, password)
    .then(
      (response) => { 
        localStorage.setItem('userData', JSON.stringify(response.data.userdata));
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('mhToken', response.data.mhToken);
        localStorage.setItem('isLoggedIn', true);

        axios.defaults.headers.common.authorization = response.data.token;
        axios.defaults.headers.common.mhauth = response.data.mhToken;
        axios.defaults.headers.common.idtoauth = response.data.userdata.id;
        
        setLoadingBtn(false); 
        navigate('/main');
      }
    )
    .catch((error) => { 
      customNot('error', 'Error de autenticación', 'Revise credenciales o conexión a la red'); 
      setLoadingBtn(false);
      document.getElementById('g-login-password-input').focus();
    });
  }

  return (
    getUserIsLoggedIn() ? <Navigate to="/main" replace /> : 
    <Wrapper xCenter yCenter heightFitScreen>
      <Container>
        <Row gutter={0}>
          <Col span={12}>
          </Col>
          <Col span={12} style={{ backgroundColor: '#FFFFFF', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p className='title'>Puma Santa Rosa</p>
            <p className='label'>Usuario:</p>
            <Input
              addonBefore={<UserOutlined />}
              placeholder="Juan" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id={'g-login-username-input'}
              onKeyUp={
                (e) => {
                  if (e.key === 'Enter')
                  document.getElementById('g-login-password-input').focus();
                }
              }
            />
            <p className='label'>Contraseña:</p>
            <Input.Password
              addonBefore={<KeyOutlined />}
              placeholder="****"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={
                (e) => {
                  if (e.key === 'Enter')
                  loginAction()
                }
              }
              id={'g-login-password-input'}
            />
            <Button 
              loading={loadingBtn} 
              style={{ width: '100%', marginTop: 40, backgroundColor: '#4B81E1' }} 
              onClick={() => loginAction()}
              type={'primary'}
            >
              Acceder
            </Button>
            <p className='copyright'>SigProCOM 2024</p>
          </Col>
        </Row>
      </Container>
      <Modal
        centered
        width={350}
        closable={true}
        closeIcon={<></>}
        maskClosable={true}
        open={openForcedCloseWarning}
        onOk={() => {
          setOpenForcedCloseWarning(false);
        }}
        okText={'Entendido'}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <Row gutter={8}>
          <Col span={3} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InfoCircleTwoTone twoToneColor={'#1677ff'} style={{ fontSize: '24px' }} />
          </Col>
          <Col span={21}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>Sesión terminada</p>
          </Col>
          <Col span={3}>
          </Col>
          <Col span={21}>
            <p style={{ margin: 0, fontSize: 14, color: 'gray' }}>Por su seguridad su sesión ha terminado debido a un periodo de inactividad</p>
          </Col>
        </Row>
      </Modal>
    </Wrapper>
  );
}

export default Login;