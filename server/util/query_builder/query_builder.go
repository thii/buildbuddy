package query_builder

import (
	"fmt"
	"strings"
)

const (
	whereSQLKeyword  = "WHERE"
	groupBySQLPhrase = "GROUP BY"
	orderBySQLPhrase = "ORDER BY"
	limitSQLKeyword  = "LIMIT"
	offsetSQLKeyword = "OFFSET"
	andQueryJoiner   = "AND"
	orQueryJoiner    = "OR"
)

func pad(clause string) string {
	if clause[0] != ' ' {
		clause = " " + clause
	}
	if clause[len(clause)-1] != ' ' {
		clause = clause + " "
	}
	return clause
}

type Query struct {
	limit        *int64
	offset       *int64
	orderBy      string
	groupBy      string
	baseQuery    string
	arguments    []interface{}
	whereClauses []string
	ascending    bool
}

func NewQuery(baseQuery string) *Query {
	return &Query{
		baseQuery:    baseQuery,
		whereClauses: make([]string, 0),
		arguments:    make([]interface{}, 0),
	}
}

func (q *Query) AddWhereClause(clause string, args ...interface{}) *Query {
	clause = pad(clause)
	q.whereClauses = append(q.whereClauses, clause)
	for _, arg := range args {
		q.arguments = append(q.arguments, arg)
	}
	return q
}

func (q *Query) SetOrderBy(orderByField string, ascending bool) *Query {
	q.orderBy = orderByField
	q.ascending = ascending
	return q
}

func (q *Query) SetGroupBy(groupByField string) *Query {
	q.groupBy = groupByField
	return q
}

func (q *Query) SetLimit(limit int64) *Query {
	q.limit = &limit
	return q
}

func (q *Query) SetOffset(offset int64) *Query {
	q.offset = &offset
	return q
}
func (q *Query) Build() (string, []interface{}) {
	// Reference: SELECT foo FROM TABLE WHERE bar = baz ORDER BY ack ASC LIMIT 10
	fullQuery := q.baseQuery
	if len(q.whereClauses) > 0 {
		whereRestrict := strings.Join(q.whereClauses, andQueryJoiner)
		fullQuery += pad(whereSQLKeyword) + pad(whereRestrict)
	}
	if q.groupBy != "" {
		fullQuery += pad(groupBySQLPhrase) + pad(q.groupBy)
	}
	if q.orderBy != "" {
		fullQuery += pad(orderBySQLPhrase) + pad(q.orderBy)
		if q.ascending {
			fullQuery += "ASC"
		} else {
			fullQuery += "DESC"
		}
	}
	if q.limit != nil {
		fullQuery += pad(limitSQLKeyword) + pad(fmt.Sprintf("%d", *q.limit))
	}
	if q.offset != nil {
		fullQuery += pad(offsetSQLKeyword) + pad(fmt.Sprintf("%d", *q.offset))
	}
	return fullQuery, q.arguments
}

type OrClauses struct {
	whereClauses []string
	arguments    []interface{}
}

func (o *OrClauses) AddOr(clause string, args ...interface{}) *OrClauses {
	o.whereClauses = append(o.whereClauses, pad(clause))
	for _, arg := range args {
		o.arguments = append(o.arguments, arg)
	}
	return o
}

func (o *OrClauses) Build() (string, []interface{}) {
	fullQuery := ""
	if len(o.whereClauses) > 0 {
		whereRestrict := strings.Join(o.whereClauses, orQueryJoiner)
		fullQuery += pad(whereRestrict)
	}
	return fullQuery, o.arguments
}
