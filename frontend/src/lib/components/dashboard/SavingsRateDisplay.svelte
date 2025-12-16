<script lang="ts">
	/**
	 * SavingsRateDisplay Component - Display current savings rate vs 10% goal
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/tasks.md line 180
	 * @see specs/001-personal-finance-tracker/spec.md line 83
	 * @see specs/002-settings-i18n-currency/tasks.md line 136
	 */
	import { analyticsStore } from '$lib';
	import { t } from '$lib/i18n';

	// Subscribe to savings rate
	const savingsRate = analyticsStore.savingsRate;

	// Savings goal (10% as per spec)
	const SAVINGS_GOAL = 10;

	/**
	 * Get status based on savings rate
	 */
	$: status = getSavingsStatus($savingsRate, $t);

	// eslint-disable-next-line max-lines-per-function
	function getSavingsStatus(
		rate: number,
		$t: (key: string) => string
	): {
		label: string;
		color: string;
		bgColor: string;
		message: string;
	} {
		if (rate >= SAVINGS_GOAL) {
			return {
				label: $t('dashboard.savingsRate.status.excellent'),
				color: 'text-green-600',
				bgColor: 'bg-green-100',
				message: $t('dashboard.savingsRate.status.excellentMessage')
			};
		} else if (rate >= SAVINGS_GOAL * 0.5) {
			return {
				label: $t('dashboard.savingsRate.status.good'),
				color: 'text-blue-600',
				bgColor: 'bg-blue-100',
				message: $t('dashboard.savingsRate.status.goodMessage')
			};
		} else if (rate > 0) {
			return {
				label: $t('dashboard.savingsRate.status.fair'),
				color: 'text-yellow-600',
				bgColor: 'bg-yellow-100',
				message: $t('dashboard.savingsRate.status.fairMessage')
			};
		} else {
			return {
				label: $t('dashboard.savingsRate.status.needsAttention'),
				color: 'text-red-600',
				bgColor: 'bg-red-100',
				message: $t('dashboard.savingsRate.status.needsAttentionMessage')
			};
		}
	}

	/**
	 * Calculate progress percentage (capped at 100%)
	 */
	$: progressPercentage = Math.min(($savingsRate / SAVINGS_GOAL) * 100, 100);
</script>

<div class="savings-rate-display">
	<div class="bg-white border border-gray-200 rounded-lg p-6">
		<div class="mb-4">
			<h3 class="text-xl font-semibold text-gray-900 mb-2">{$t('dashboard.savingsRate.title')}</h3>
			<p class="text-sm text-gray-600">
				{$t('dashboard.savingsRate.description')}
			</p>
		</div>

		<!-- Current Rate Display -->
		<div class="text-center mb-6">
			<p class="text-6xl font-bold {status.color}">
				{$savingsRate.toFixed(1)}%
			</p>
			<p class="text-sm text-gray-600 mt-2">{$t('dashboard.savingsRate.currentRate')}</p>
		</div>

		<!-- Progress Bar -->
		<div class="mb-6">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm text-gray-600">{$t('dashboard.savingsRate.progressToGoal')}</span>
				<span class="text-sm font-semibold text-gray-900">
					{SAVINGS_GOAL}% {$t('dashboard.savingsRate.goal')}
				</span>
			</div>

			<div class="w-full bg-gray-200 rounded-full h-4 relative">
				<div
					class="h-4 rounded-full transition-all duration-500 {$savingsRate >= SAVINGS_GOAL
						? 'bg-green-600'
						: 'bg-blue-600'}"
					style="width: {progressPercentage}%"
				></div>

				<!-- Goal Marker (at 10%) -->
				<div
					class="absolute top-0 h-4 w-1 bg-red-500"
					style="left: {Math.min((SAVINGS_GOAL / Math.max($savingsRate, SAVINGS_GOAL)) * 100, 100)}%"
					title="{SAVINGS_GOAL}% Goal"
				></div>
			</div>

			<div class="flex justify-between items-center mt-1">
				<span class="text-xs text-gray-500">0%</span>
				<span class="text-xs text-gray-500">{Math.max($savingsRate, SAVINGS_GOAL).toFixed(0)}%</span>
			</div>
		</div>

		<!-- Status Badge and Message -->
		<div class="{status.bgColor} rounded-lg p-4">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-semibold {status.color}">{$t('dashboard.savingsRate.status.label')}: {status.label}</span>
				{#if $savingsRate >= SAVINGS_GOAL}
					<span class="text-2xl">✓</span>
				{/if}
			</div>
			<p class="text-sm text-gray-700">{status.message}</p>
		</div>

		<!-- Comparison Info -->
		{#if $savingsRate < SAVINGS_GOAL && $savingsRate >= 0}
			<div class="mt-4 text-sm text-gray-600">
				<p>
					{$t('dashboard.savingsRate.needToSave')}
					<span class="font-semibold text-gray-900">
						{(SAVINGS_GOAL - $savingsRate).toFixed(1)}%
					</span>
					{$t('dashboard.savingsRate.moreToReachGoal')}
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.savings-rate-display {
		width: 100%;
	}

	/* Mobile-first responsive design */
	@media (max-width: 640px) {
		.text-6xl {
			font-size: 3rem;
		}
	}
</style>
