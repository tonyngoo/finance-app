import { type ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { css } from '@emotion/css';
import { type TFunction } from 'i18next';

import { type Language } from 'loot-core/types/prefs';

import { useGlobalPref } from '../../hooks/useGlobalPref';
import { availableLanguages, setI18NextLanguage } from '../../i18n';
import { theme as themeStyle } from '../../style';
import { tokens } from '../../tokens';
import { Menu } from '../common/Menu';
import { Select, type SelectOption } from '../common/Select';
import { Text } from '../common/Text';
import { View } from '../common/View';
import { useSidebar } from '../sidebar/SidebarProvider';

import { Setting } from './UI';

const languageOptions = (t: TFunction): SelectOption[] =>
  [
    ['', t('System default')] as [string, string],
    Menu.line as typeof Menu.line,
  ].concat(
    availableLanguages.map(lang => [
      lang,
      new Intl.DisplayNames([lang], {
        type: 'language',
      }).of(lang) || lang,
    ]),
  );

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View
      style={{
        alignItems: 'flex-start',
        flexGrow: 1,
        gap: '0.5em',
        width: '100%',
      }}
    >
      <Text style={{ fontWeight: 500 }}>{title}</Text>
      <View style={{ alignItems: 'flex-start', gap: '1em' }}>{children}</View>
    </View>
  );
}

export function LanguageSettings() {
  const { t } = useTranslation();
  const sidebar = useSidebar();
  const [language, setLanguagePref] = useGlobalPref('language');

  return (
    <Setting
      primaryAction={
        <View
          style={{
            flexDirection: 'column',
            gap: '1em',
            width: '100%',
            [`@media (min-width: ${
              sidebar.floating
                ? tokens.breakpoint_small
                : tokens.breakpoint_medium
            })`]: {
              flexDirection: 'row',
            },
          }}
        >
          <Column title={t('Language')}>
            <Select
              onChange={value => {
                setLanguagePref(value as Language);
                setI18NextLanguage(value);
              }}
              value={language ?? ''}
              defaultLabel={t('Select language')}
              options={languageOptions(t)}
              className={css({
                '&[data-hovered]': {
                  backgroundColor: themeStyle.buttonNormalBackgroundHover,
                },
              })}
            />
          </Column>
        </View>
      }
    >
      <Text>
        <Trans>
          <strong>Languages</strong> change the language to your preferred
          choice.
        </Trans>
      </Text>
    </Setting>
  );
}
