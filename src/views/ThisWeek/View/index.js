import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import { ProfileLink } from '../../../components/ProfileLink';
import { Button, DestinyKey } from '../../../components/UI/Button';

import Flashpoint from '../Modules/Flashpoint';
import FeaturedActivities from '../Modules/FeaturedActivities';
import CrucibleRotators from '../Modules/CrucibleRotators';
import Nightfalls from '../Modules/Nightfalls';
import Raid from '../Modules/Raid';
import DreamingCityAscendantChallenge from '../Modules/DreamingCityAscendantChallenge';
import DreamingCityCurse from '../Modules/DreamingCityCurse';
import DreamingCityShatteredThrone from '../Modules/DreamingCityShatteredThrone';
import Menagerie from '../Modules/Menagerie';
import EscalationProtocol from '../Modules/EscalationProtocol';
import Reckoning from '../Modules/Reckoning';

import { moduleRules, headOverride } from '../Customise';

import './styles.css';

class ThisWeek extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);

    this.props.rebindTooltips();
  }

  components = {
    Flashpoint: {
      c: Flashpoint
    },
    FeaturedActivities: {
      c: FeaturedActivities
    },
    CrucibleRotators: {
      c: CrucibleRotators
    },
    Nightfalls: {
      c: Nightfalls
    },
    Raid: {
      c: Raid
    },
    DreamingCityAscendantChallenge: {
      c: DreamingCityAscendantChallenge
    },
    DreamingCityCurse: {
      c: DreamingCityCurse
    },
    DreamingCityShatteredThrone: {
      c: DreamingCityShatteredThrone
    },
    Menagerie: {
      c: Menagerie
    },
    EscalationProtocol: {
      c: EscalationProtocol
    },
    Reckoning: {
      c: Reckoning
    }
  };

  render() {
    const { t, member, layout } = this.props;
    const characterActivities = member.data.profile.characterActivities.data;

    const resetTime = '17:00:00Z';

    const cycleInfo = {
      epoch: {
        // start of cycle in UTC
        ascendant: new Date(`2018-09-04T${resetTime}`).getTime(),
        curse: new Date(`2018-09-11T${resetTime}`).getTime(),
        ep: new Date(`2018-05-08T${resetTime}`).getTime(),
        reckoning: new Date(`2019-05-21T${resetTime}`).getTime(),
        whisper: new Date(`2019-05-28T${resetTime}`).getTime(),
        zerohour: new Date(`2019-05-28T${resetTime}`).getTime(),
        menagerie: new Date(`2019-06-04T${resetTime}`).getTime()
      },
      cycle: {
        // how many week cycle
        ascendant: 6,
        curse: 3,
        ep: 5,
        reckoning: 2,
        whisper: 3,
        zerohour: 3,
        menagerie: 3
      },
      elapsed: {}, // elapsed time since cycle started
      week: {} // current week in cycle
    };

    const time = new Date().getTime();
    const msPerWk = 604800000;

    for (var cycle in cycleInfo.cycle) {
      cycleInfo.elapsed[cycle] = time - cycleInfo.epoch[cycle];
      cycleInfo.week[cycle] = Math.floor((cycleInfo.elapsed[cycle] / msPerWk) % cycleInfo.cycle[cycle]) + 1;
    }

    const userHead = {
      ...layout.groups.find(g => g.id === 'head'),
      ...headOverride,
      type: 'user',
      className: ['head']
    };

    userHead.cols = userHead.cols.map(c => {
      const FeaturedActivitiesIndex = c.mods.findIndex(m => m.component === 'FeaturedActivities');

      if (FeaturedActivitiesIndex > -1) {
        c.mods[FeaturedActivitiesIndex].condition = Boolean(characterActivities[member.characterId].availableActivities.filter(a => [3753505781, 1454880421].includes(a.activityHash)).length);
      }

      return c;
    });

    const userBody = layout.groups
      .filter(g => g.type === 'body')
      .map(group => {
        const className = [];

        if (group.cols.filter(c => c.mods.filter(m => m.component === 'Nightfalls').length).length) {
          return {
            ...group,
            className,
            type: 'user',
            components: ['Nightfalls']
          };
        }

        if (group.cols.filter(c => c.mods.filter(m => moduleRules.full.filter(f => f === m.component).length).length).length) className.push('full');
        if (group.cols.filter(c => c.mods.filter(m => 'SeasonPass' === m.component).length).length) className.push('season-pass');

        const cols = group.cols.map(c => {
          const className = [];

          if (c.mods.filter(m => moduleRules.double.filter(f => f === m.component).length).length) className.push('double');

          return {
            ...c,
            className
          };
        });

        return {
          ...group,
          className,
          type: 'user',
          cols
        };
      });

    const modules = [userHead, ...userBody];

    return (
      <>
        <div className='groups'>
          {modules.map((group, g) => {
            if (group.components) {
              if (group.condition === undefined || group.condition) {
                return (
                  <div key={g} className={cx('group', ...(group.className || []))}>
                    {group.components.map((c, i) => {
                      const Component = this.components[c].c;

                      return <Component key={i} />;
                    })}
                  </div>
                );
              } else {
                return null;
              }
            } else {
              const modFullSpan = group.cols.findIndex(c => c.mods.find(m => moduleRules.full.includes(m.component)));
              const modDoubleSpan = group.cols.findIndex(c => c.mods.find(m => moduleRules.double.includes(m.component)));

              const cols = modFullSpan > -1 ? group.cols.slice(0, 1) : modDoubleSpan > -1 ? group.cols.slice(0, 3) : group.cols.filter(c => c.mods.filter(m => m.condition === undefined || m.condition).length);

              return (
                <div key={g} className={cx('group', ...(group.className || []))}>
                  {cols
                    .map((col, c) => {
                      if ((col.condition === undefined || col.condition) && col.mods.length) {
                        return (
                          <div key={c} className={cx('column', ...(col.className || []))}>
                            {col.mods
                              .map((mod, m) => {
                                if (mod.condition === undefined || mod.condition) {
                                  const Component = this.components[mod.component].c;
                                  const settings = (mod.settings || []).reduce(function(map, obj) {
                                    map[obj.id] = obj.value;
                                    return map;
                                  }, {});

                                  return (
                                    <div key={m} className={cx('module', ...(mod.className || []))}>
                                      <Component cycleInfo={cycleInfo} {...settings} />
                                    </div>
                                  );
                                } else {
                                  return false;
                                }
                              })
                              .map(m => m)}
                          </div>
                        );
                      } else {
                        return false;
                      }
                    })
                    .map(c => c)}
                </div>
              );
            }
          })}
        </div>
        <div className='sticky-nav'>
          <div className='wrapper'>
            <div />
            <ul>
              <li>
                <ProfileLink className='button' to='/this-week/customise'>
                  <DestinyKey type='modify' />
                  {t('Customise')}
                </ProfileLink>
              </li>
            </ul>
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    auth: state.auth,
    layout: state.layouts['this-week']
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: value => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    }
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(ThisWeek);
