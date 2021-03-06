'use strict'

/* global describe, expect, it, jasmine */
const expect = require('chai').expect
const DbConnector = require('../src/connector')
const EventEmitter = require('events').EventEmitter

const settings = {
	'region': 'eu-central-1',
	'bufferTimeout': 1200
};

const MESSAGE_TIME = 200;
const APP_ID = 'Xj43s3';
describe( 'the message connector has the correct structure', () => {
	var dbConnector

	it( 'throws an error if required connection parameters are missing', () => {
		expect( () => { new DbConnector( 'gibberish' ) } ).to.throw()
	})

	it( 'creates the dbConnector', () => {
		dbConnector = new DbConnector( settings )
		expect( dbConnector.isReady ).to.equal( true )
	})

	it( 'implements the cache/storage connector interface', () =>  {
		expect( dbConnector.name ).to.be.a( 'string' )
		expect( dbConnector.version ).to.be.a( 'string' )
		expect( dbConnector.get ).to.be.a( 'function' )
		expect( dbConnector.set ).to.be.a( 'function' )
		expect( dbConnector.delete ).to.be.a( 'function' )
		expect( dbConnector.createTable ).to.be.a( 'function' )
		expect( dbConnector.deleteTable ).to.be.a( 'function' )
		expect( dbConnector instanceof EventEmitter ).to.equal( true )
	});
});

describe( 'creates tables', function() {
	var dbConnector;
	this.timeout( 100000 );

	it( 'creates the dbConnector', () => {
		dbConnector = new DbConnector( settings )
		expect( dbConnector.isReady ).to.equal( true )
	})

	it( 'creates a table', ( done ) => {
		dbConnector.createTable( APP_ID, ( err, data ) => {
			expect( err ).to.be.null;
			done();
		});
	});

	it( 'fails when trying to create an existing table', ( done ) => {
		dbConnector.createTable( APP_ID, ( err, data ) => {
			expect( err ).to.not.be.null;
			done();
		});
	});

});

describe( 'sets, gets and deletes values', function(){
	var dbConnector;
	var key = APP_ID + 'someValue';
	var getValue = () => { return {  _d: { firstname: 'Wolfram' }, v: 10 }; };

	it( 'creates the dbConnector', () => {
		dbConnector = new DbConnector( settings )
		expect( dbConnector.isReady ).to.equal( true )
	})

	it( 'retrieves a non existing value', ( done ) => {
		dbConnector.get( key, ( error, value ) => {
			expect( error ).to.equal( null )
			expect( value ).to.equal( null )
			done()
		})
	});

	it( 'sets a value', ( done ) => {
		dbConnector.set( key, getValue(), ( error ) => {
			expect( error ).to.equal( null )
			done()
		})
	});

	it( 'retrieves an existing value', ( done ) => {
		dbConnector.get( key, ( error, value ) => {
			expect( error ).to.equal( null )
			expect( value ).to.deep.equal( getValue() )
			done()
		})
	});

	it( 'deletes a value', ( done ) => {
		dbConnector.delete( key, ( error ) => {
			expect( error ).to.equal( null )
			done()
		})
	});

	it( 'Can\'t retrieve a deleted value', ( done ) => {
		dbConnector.get( key, ( error, value ) => {
			expect( error ).to.equal( null )
			expect( value ).to.equal( null )
			done()
		})
	});
})

describe( 'batches multiple writes', function(){
	var dbConnector;
	var key = APP_ID + 'someOtherValue';
	var getValue = ( count ) => { return {  _d: { firstname: 'Egon', count: count }, v: 10 }; };

	it( 'creates the dbConnector', () => {
		dbConnector = new DbConnector( settings )
		expect( dbConnector.isReady ).to.equal( true )
	})



	it( 'sets values from 1 to 3', ( done ) => {
		var result = {};
		var cb = function( val ) {
			result[ val ] = true;

			if( result[ 1 ] && result[ 2 ] && result[ 3 ] ) {
				done();
			}
		}
		dbConnector.set( key, getValue( 1 ), ( error ) => {
			expect( error ).to.equal( null )
			cb( 1 );
		})

		dbConnector.set( key, getValue( 2 ), ( error ) => {
			expect( error ).to.equal( null )
			cb( 2 );
		})

		dbConnector.set( key, getValue( 3 ), ( error ) => {
			expect( error ).to.equal( null )
			cb( 3 );
		})
	});


	it( 'retrieves the last value', ( done ) => {
		dbConnector.get( key, ( error, value ) => {
			expect( error ).to.equal( null )
			expect( value._d.count ).to.equal( 3 )
			done()
		})
	});

	it( 'deletes a value', ( done ) => {
		dbConnector.delete( key, ( error ) => {
			expect( error ).to.equal( null )
			done()
		})
	});
})

describe( 'deletes tables', function() {
	var dbConnector;
	this.timeout( 100000 );

	it( 'creates the DbConnector', () => {
		dbConnector = new DbConnector( settings )
		expect( dbConnector.isReady ).to.equal( true )
	})

	it( 'deletes a table', ( done ) => {
		dbConnector.deleteTable( APP_ID, ( err, data ) => {
			expect( err ).to.be.null;
			done();
		});
	});

	it( 'fails when trying to delete a table a second time', ( done ) => {
		dbConnector.deleteTable( APP_ID, ( err, data ) => {
			expect( err ).to.not.be.null;
			done();
		});
	});
});