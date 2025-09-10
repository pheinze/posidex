import superjson from 'superjson';
import { Decimal } from 'decimal.js';

// Register the custom Decimal.js serializer/deserializer on the main instance
superjson.registerCustom<Decimal, string>(
  {
    isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
    serialize: (v) => v.toJSON(),
    deserialize: (v) => new Decimal(v),
  },
  'decimal.js'
);

export default superjson;
