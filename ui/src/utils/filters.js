export function formatDate(date) {
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
}


export function buildFilter({
  page,
  rowsPerPage,
  order,
  orderBy,
  startDate,
  endDate,
  validSortFields = [],
  searchTextValue,
  status,
  isActive,
  roles,
  additionalWhereOrConditions = [],
  combineName = false,
}) {
  const skip = page * rowsPerPage;
  const limit = rowsPerPage;

  const where = { isDeleted: false };
  const orConditions = [];


  // Date filter
  if (startDate && endDate) {

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    where.createdAt = { between: [start, end] }

  } else if (startDate) {
    const start = new Date(startDate);
    where.createdAt = { gte: start }
  } else if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.createdAt = { lte: end }
  }

  // Search text filter
  if (searchTextValue?.trim()) {
    const text = searchTextValue.trim();


    // Other fields
    validSortFields.forEach((field) => {
      if (['',].includes(field)) {
        // Only search numeric fields if input is a valid number
        if (!Number.isNaN(Number(text))) {
          orConditions.push({ [field]: Number(text) });
        }
      } else {
        orConditions.push({ [field]: { like: `%${text}%` } });
      }
    });
  }


  // Status Filter
  if (status !== undefined && status !== 'all') {
    where.status = { like: `%${status}%` }
  };

  // Status Filter
  if (isActive !== undefined && isActive !== 'all') {
    if (isActive === '1' || isActive === 1) {
      where.isActive = true;
    } else if (isActive === '0' || isActive === 0) {
      where.isActive = false;
    }
  }


  // Roles filter
if (roles?.length) {
  if (!where.or){
    where.or = []
  }
  where.or = roles.map(role => ({
    permissions: { like: `%["${role.toLowerCase()}"]%`, options: 'i' }
  }));
}



  console.log('where.or', where?.or);
  if (orConditions.length) {
    where.or = orConditions;
  }
  if (additionalWhereOrConditions?.length) {
    additionalWhereOrConditions.forEach((cond) => {
      // Only push the condition if it has at least one key with a non-null value
      console.log('condition', cond);
      const validKeys = Object.keys(cond || {}).filter(
        (key) => cond[key] !== null && cond[key] !== undefined
      );

      console.log('valid keys', validKeys);
      if (validKeys.length > 0) {
        // Only include the valid keys
        const validCond = {};
        validKeys.forEach((key) => {
          validCond[key] = cond[key];
        });
        if (!where.or) {
          where.or = [];
        }
        where.or.push(validCond);
      }
    });
  }
  console.log('where.or 1', where?.or);
  const filter = { skip, limit, where };

  console.log('buildFilter (final):', JSON.stringify(filter, null, 2));
  return filter;
}
