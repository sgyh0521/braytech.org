import React from 'react';
import { connect } from 'react-redux';

import { t } from '../../../utils/i18n';
import * as bungie from '../../../utils/bungie';
import Spinner from '../../../components/UI/Spinner';
import Mode from '../../../components/Reports/Mode';
import Matches from '../../../components/Reports/Matches';
import ParentModeLinks from '../ParentModeLinks';

class Strikes extends React.Component {
  state = {
    loading: false
  };

  strikes = {
    all: {
      allStrikes: {
        mode: 18
      },
      scored_nightfall: {
        mode: 46
      }
    }
  };

  fetch = async () => {
    const { member } = this.props;

    if (this.mounted) {
      this.setState(p => ({
        ...p,
        loading: true
      }));
    }

    let stats = await bungie.GetHistoricalStats(
      member.membershipType,
      member.membershipId,
      member.characterId,
      '1',
      Object.values(this.strikes.all).map(m => m.mode),
      '0'
    );

    stats = (stats && stats.ErrorCode === 1 && stats.Response) || [];

    for (const mode in stats) {
      if (stats.hasOwnProperty(mode)) {
        if (!stats[mode].allTime) {
          return;
        }
        Object.entries(stats[mode].allTime).forEach(([key, value]) => {
          this.strikes.all[mode][key] = value;
        });
      }
    }

    if (this.mounted) {
      this.setState(p => ({
        ...p,
        loading: false
      }));
    }

    return true;
  };

  componentDidMount() {
    this.mounted = true;

    this.refreshData();
    this.startInterval();
  }

  componentWillUnmount() {
    this.mounted = false;

    this.clearInterval();
  }

  refreshData = async () => {
    if (!this.state.loading) {
      //console.log('refresh start');
      await this.fetch();
      //console.log('refresh end');
    } else {
      //console.log('refresh skipped');
    }
  };

  startInterval() {
    this.refreshDataInterval = window.setInterval(this.refreshData, 30000);
  }

  clearInterval() {
    window.clearInterval(this.refreshDataInterval);
  }

  render() {
    return (
      <div className='view strikes' id='multiplayer'>
        <div className='module-l1'>
          <div className='module-l2'>
            <div className='content head'>
              <div className='page-header'>
                <div className='sub-name'>{t('Post Game Carnage Reports')}</div>
                <div className='name'>{t('Strikes')}</div>
              </div>
            </div>
          </div>
          <div className='module-l2'>
            <ParentModeLinks />
          </div>
          <div className='module-l2'>
            <div className='content'>
              {Object.values(this.strikes.all.allStrikes).length > 1 ? (
                <ul className='list modes'>
                  {Object.values(this.strikes.all).map(m => (
                    <Mode key={m.mode} stats={m} root='/reports/strikes' defaultMode='18' />
                  ))}
                </ul>
              ) : (
                <Spinner mini />
              )}
            </div>
          </div>
        </div>
        <div className='module-l1' id='matches'>
          <div className='content'>
            <div className='sub-header'>
              <div>{t('Recent strikes')}</div>
            </div>
            <Matches mode={this.props.mode || 18} limit='40' offset={this.props.offset} root='/reports/strikes' />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    pgcr: state.pgcr
  };
}

export default connect(mapStateToProps)(Strikes);
