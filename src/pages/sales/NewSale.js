import React, { useEffect, useState, useRef } from 'react';
import { Result, Comment, Avatar } from 'antd';

import { getUserMyCashier } from '../../utils/LocalData';
import cashiersServices from '../../services/CashiersServices';
import StoreModule from './StoreModule';
import GasStationModule from './GasStationModule';

function NewSale() {
  // const navigate = useNavigate();

  const [fetching, setFetching] = useState(false);
  const [ableToProcess, setIsAbleToProcess] = useState(false);
  const [currentCashierExtraInfo, setCurrentCashierExtraInfo] = useState({});

  async function checkIfAbleToProcess() {
    setFetching(true);

    const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());

    const {
      isOpen,
      currentShiftcutId,
      name,
      productDistributionsId,
      productDistributionsName,
      productDistributionsIconUrl,
      estCodeInternal,
      estCodeMH,
      posCodeInternal,
      posCodeMH
    } = response.data[0];

    if (isOpen === 1 && currentShiftcutId !== null) {
      setIsAbleToProcess(true);
      setCurrentCashierExtraInfo({
        name,
        productDistributionsId,
        productDistributionsName,
        productDistributionsIconUrl,
        estCodeInternal,
        estCodeMH,
        posCodeInternal,
        posCodeMH
      })
    }

    setFetching(false);
  }

  useEffect(() => {
    checkIfAbleToProcess();
  }, []);

  function renderModuleByDistId() {
    switch(currentCashierExtraInfo?.productDistributionsId) {
      case 1:
        return <StoreModule
          productDistributionType={currentCashierExtraInfo?.productDistributionsId || null}
          cashierInfoContainer={
            <Comment
              // actions={actions}
              author={<p style={{ margin: 0 }}>{'Usted esta operando en'}</p>}
              avatar={<Avatar src={currentCashierExtraInfo?.productDistributionsIconUrl} alt="prodDisImg" />}
              content={<p style={{ margin: 0 }}>{`${currentCashierExtraInfo?.name}`}</p>}
              datetime={<span style={{ margin: 0 }}>{currentCashierExtraInfo?.productDistributionsName}</span>}
            />
          }
        />
        case 2:
          return <GasStationModule
            productDistributionType={currentCashierExtraInfo?.productDistributionsId || null}
            cashierInfoContainer={
              <Comment
                // actions={actions}
                author={<p style={{ margin: 0 }}>{'Usted esta operando en'}</p>}
                avatar={<Avatar src={currentCashierExtraInfo?.productDistributionsIconUrl} alt="prodDisImg" />}
                content={<p style={{ margin: 0 }}>{`${currentCashierExtraInfo?.name}`}</p>}
                datetime={<span style={{ margin: 0 }}>{currentCashierExtraInfo?.productDistributionsName}</span>}
              />
            }
          />
      default:
        return <Result
          status="info"
          title={<p style={{ color: '#434343' }}>{`No hay modulo para trabajar`}</p>}
          subTitle={<p style={{ color: '#434343' }}>{``}</p>}
        />
    }
  }

  return (
    !ableToProcess ? <>
      <Result
        status="info"
        title={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando informacion de su caja" : "Caja cerrada, operaciones de venta limitadas"}`}</p>}
        subTitle={<p style={{ color: '#434343' }}>{`${fetching ? "Por favor espere, esto puede tardar unos segundos" : "Usted debe aperturar un nuevo turno en su caja para poder procesar"}`}</p>}
      />
    </> : renderModuleByDistId()
  );
}

export default NewSale;
