import { FoldableCard } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Metrics } from 'calypso/data/site-profiler/types';
import { CircularPerformanceScore } from 'calypso/hosting/performance/components/circular-performance-score/circular-performance-score';
import {
	metricsNames,
	mapThresholdsToStatus,
	displayValue,
} from 'calypso/performance-profiler/utils/metrics';

import './styles-v2.scss';

type Props = Record< Metrics, number > & {
	activeTab: Metrics | null;
	setActiveTab: ( tab: Metrics | null ) => void;
	children: React.ReactNode;
};
type HeaderProps = {
	displayName: string;
	metricKey: Metrics;
	metricValue: number;
	isActive?: boolean;
};

const CardHeader = ( props: HeaderProps ) => {
	const { displayName, metricKey, metricValue, isActive } = props;
	const status = mapThresholdsToStatus( metricKey, metricValue );
	const isPerformanceScoreSelected = metricKey === 'overall';

	const statusClassName = status === 'needsImprovement' ? 'needs-improvement' : status;
	return (
		<div className="core-web-vitals-accordion-v2__header">
			<div className="core-web-vitals-accordion-v2__header-text">
				<span className="core-web-vitals-accordion-v2__header-text-name">{ displayName }</span>

				{ isPerformanceScoreSelected ? (
					<div className="metric-tab-bar-v2__tab-metric" style={ { marginTop: '6px' } }>
						<CircularPerformanceScore score={ metricValue } size={ isActive ? 72 : 48 } />
					</div>
				) : (
					<span
						className={ `core-web-vitals-accordion-v2__header-text-value ${ statusClassName } ` }
					>
						{ displayValue( metricKey, metricValue ) }
					</span>
				) }
			</div>
		</div>
	);
};

export const CoreWebVitalsAccordionV2 = ( props: Props ) => {
	const { activeTab, setActiveTab, children } = props;
	const translate = useTranslate();

	const onClick = ( key: Metrics ) => {
		// If the user clicks the current tab, close it.
		if ( key === activeTab ) {
			setActiveTab( null );
		} else {
			setActiveTab( key as Metrics );
		}
	};

	const entries = Object.entries( metricsNames );
	const overallEntry = entries.find( ( [ key ] ) => key === 'overall' );
	const otherEntries = entries.filter( ( [ key ] ) => key !== 'overall' );

	const reorderedEntries = overallEntry ? [ overallEntry, ...otherEntries ] : otherEntries;

	return (
		<div className="core-web-vitals-accordion-v2">
			{ reorderedEntries.map( ( [ key, { name: displayName } ] ) => {
				if ( props[ key as Metrics ] === undefined || props[ key as Metrics ] === null ) {
					return null;
				}

				// Only display TBT if INP is not available
				if ( key === 'tbt' && props[ 'inp' ] !== undefined && props[ 'inp' ] !== null ) {
					return null;
				}

				return (
					<FoldableCard
						className={ clsx( 'core-web-vitals-accordion-v2__card', {
							[ 'core-web-vitals-accordion-v2__card--overall' ]: key === 'overall',
						} ) }
						key={ key }
						header={
							<CardHeader
								displayName={ displayName }
								metricKey={ key as Metrics }
								metricValue={ props[ key as Metrics ] }
								isActive={ key === activeTab }
							/>
						}
						hideSummary
						screenReaderText={ translate( 'More' ) }
						compact
						clickableHeader
						smooth
						iconSize={ 18 }
						onClick={ () => onClick( key as Metrics ) }
						expanded={ key === activeTab }
					>
						{ children }
					</FoldableCard>
				);
			} ) }
		</div>
	);
};
