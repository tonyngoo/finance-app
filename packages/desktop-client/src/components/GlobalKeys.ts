import { useEffect } from 'react';

//import * as Platform from 'loot-core/src/client/platform';

import { useNavigate } from '../hooks/useNavigate';

export function GlobalKeys() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      // if (Platform.isBrowser) {
      //   return;
      // }

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); //Prevent tab switching

        switch (e.key) {
          case '1':
            navigate('/budget');
            break;
          case '2':
            navigate('/reports');
            break;
          case '3':
            navigate('/schedules');
            break;
          case '4':
            navigate('/payees');
            break;
          case '5':
            navigate('/rules');
            break;
          case '6':
            navigate('/accounts');
            break;
          case '0':
            navigate('/settings');
            break;
          default:
        }
      }
    };

    document.addEventListener('keydown', handleKeys);

    return () => document.removeEventListener('keydown', handleKeys);
  }, []);

  return null;
}
