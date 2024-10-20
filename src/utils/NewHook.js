import React, { useState, useEffect } from 'react';
import { Wrapper } from '../styled-components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';

// import moment from 'moment';
// import 'moment/locale/es-mx';
// import locale from 'antd/es/date-picker/locale/es_ES';

function NewHook() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [fetching, setFetching] = useState(false);

  const [data, setData] = useState(null);

  useEffect(() => {

  }, []);
  
  useEffect(() => {
    if (state !== null) {
      // APPLY LOGIC FROM NAVIGATION PROPS
    }
  }, []);

  return (
    <Wrapper xCenter yCenter>
      
    </Wrapper>
  );
}

export default NewHook;
