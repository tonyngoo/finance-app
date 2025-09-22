import React from 'react';

import { theme } from '../../style';
import { Text } from '../common/Text';
import { View } from '../common/View';
import { Title } from '../manager/subscribe/common';
import { ListItem } from '../mobile/budget/ListItem';
import { LoadingIndicator } from '../reports/LoadingIndicator';

const sectionTitleStyle = {
  fontSize: '2rem',
  fontWeight: '600',
  color: '#FFF',
  marginBottom: '0.75rem',
  paddingBottom: '0.25rem',
};

const subtitleStyle = {
  color: '#E0E0E0',
  fontSize: '16px',
  fontWeight: 'normal',
  marginTop: '2px',
};

const InsightItem = ({ data }) => {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '50px',
        padding: '15px 0',
        width: '100%',
        paddingLeft: '20px',
        borderRadius: '5px',
        backgroundColor: theme.tableRowHeaderBackground,
      }}
    >
      <Text
        style={{
          textAlign: 'left',
          fontSize: '16px',
        }}
        data-testid="category-name"
      >
        {data}
      </Text>
    </View>
  );
};

const AiMonthlyInsights = ({
  snapshot,
  highlights,
  improvements,
  actionableInsights,
}) => {
  const isDataReady =
    snapshot &&
    highlights &&
    highlights.length > 0 &&
    improvements &&
    improvements.length > 0 &&
    actionableInsights &&
    actionableInsights.length > 0;

  return (
    <div style={{ flexShrink: 0 }}>
      <br />
      <Title text="How You Did This Month" />
      <p style={subtitleStyle}>
        🤖 <i>AI-powered insights to help you spend smarter and save more.</i>
        <br />
        <br />
        ⚠️{' '}
        <i>
          DISCLAIMER: While we strive for relevance and accuracy, please note
          that these insights may not always be 100% correct or accurate. This
          is not a subsitute for professional financial advice - consult a
          professional for financial advice.
        </i>
      </p>
      <hr style={{ width: '100%' }} />

      {isDataReady ? (
        <>
          <h2 style={sectionTitleStyle}>🌟 Financial Snapshot</h2>
          <p style={{ fontSize: '16px' }}>{snapshot}</p>
          <h2 style={sectionTitleStyle}>👍 Success Highlights</h2>
          <ListItem
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              height: 'auto',
              gap: '10px',
              border: 'none',
            }}
          >
            {highlights.map((h, i) => (
              <InsightItem key={i} data={h} />
            ))}
          </ListItem>
          <h2 style={sectionTitleStyle}>👎 Areas for Improvement</h2>
          <ListItem
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              height: 'auto',
              gap: '10px',
              border: 'none',
            }}
          >
            {improvements.map((h, i) => (
              <InsightItem key={i} data={h} />
            ))}
          </ListItem>
          <h2 style={sectionTitleStyle}>💡 Actionable Insights</h2>
          <ListItem
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              height: 'auto',
              gap: '10px',
              border: 'none',
            }}
          >
            {actionableInsights.map((h, i) => (
              <InsightItem key={i} data={h} />
            ))}
          </ListItem>
          <br />
          <br />
          <br />{' '}
        </>
      ) : (
        <LoadingIndicator />
      )}
    </div>
  );
};

export default AiMonthlyInsights;
