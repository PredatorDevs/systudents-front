import styled from 'styled-components';

export const PageLetterWrapper = styled.main`
  /* font-family: 'Courier New', monospace; */
  width: calc(816px - 80px);
  display: flex;
  flex-direction: column;
  margin: 40px;
  .header {
    font-size: 20px;
    /* font-weight: 600; */
    margin: 0px;
    text-align: center;
  }
  .legal-info-caption {
    font-size: 13px;
    margin: 0px;
    /* font-weight: 600; */
  }
  .description {
    font-size: 14px;
    margin: 0px;
    text-align: center;
  }
  .divider {
    border: 0.5px solid black;
    border-style: dashed;
    margin-top: 5px;
    margin-bottom: 5px;
  }
  .dashed-line {
    margin: 0px;
    font-size: 16px;
  }
  .info-left {
    font-size: 14px;
    margin: 0px;
    text-align: left;
  }
  .col-header, 
  .col-header-centered,
  .col-header-left,
  .col-header-right {
    font-size: 13px;
    margin: 0px;
    /* font-weight: 600; */
    border-top: 1px solid black;
    border-bottom: 1px solid black;
  }
  .col-header-centered {
    text-align: center;
  }
  .col-header-left {
    text-align: left;
  }
  .col-header-right {
    text-align: right;
  }
  .col-body, 
  .col-body-centered,
  .col-body-left,
  .col-body-right {
    font-size: 11px;
    margin: 0px;
  }
  .col-body-centered {
    text-align: center;
  }
  .col-body-left {
    text-align: left;
  }
  .col-body-right {
    text-align: right;
  }
`;
