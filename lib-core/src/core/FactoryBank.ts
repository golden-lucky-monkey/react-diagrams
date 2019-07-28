import { BaseEvent, BaseListener, BaseObserver } from './BaseObserver';
import { AbstractFactory } from './AbstractFactory';
import * as _ from 'lodash';

export interface FactoryBankListener<F extends AbstractFactory> extends BaseListener {
	/**
	 * Factory as added to rhe bank
	 */
	factoryAdded?: (event: BaseEvent & { factory: AbstractFactory }) => any;

	/**
	 * Factory was removed from the bank
	 */
	factoryRemoved?: (event: BaseEvent & { factory: AbstractFactory }) => any;
}

/**
 * Store and managed Factories that extend from Abstractfactory
 */
export class FactoryBank<F extends AbstractFactory = AbstractFactory> extends BaseObserver<FactoryBankListener<F>> {
	protected factories: { [type: string]: F };

	constructor() {
		super();
		this.factories = {};
	}

	getFactories(): F[] {
		return _.values(this.factories);
	}

	clearFactories() {
		for (let factory in this.factories) {
			this.deregisterFactory(factory);
		}
	}

	getFactory<T extends F = F>(type: string): T {
		if (!this.factories[type]) {
			throw new Error(`Cannot find factory with type [${type}]`);
		}
		return this.factories[type] as T;
	}

	registerFactory(factory: F) {
		factory.setFactoryBank(this);
		this.factories[factory.getType()] = factory;
		this.fireEvent({ factory }, 'factoryAdded');
	}

	deregisterFactory(type: string) {
		const factory = this.factories[type];
		factory.setFactoryBank(null);
		delete this.factories[type];
		this.fireEvent({ factory }, 'factoryRemoved');
	}
}
