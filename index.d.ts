// Type definitions for  1.8
// Nedb: https://github.com/louischatriot/nedb
// Definitions: https://github.com/ramiroaisen/nedb-types
// TypeScript Version: 2.3

/// <reference types="node" />

import { EventEmitter } from 'events';

export as namespace Nedb;

export type Document<T> = T & {
    _id: string
    createdAt?: Date
    updatedAt?: Date
}

export type WithTimestamps<T> = T & {createdAt: Date, updatedAt: Date}
type OptionalError = Error | void | null;

type Deep<T> = {[K: string]: any};
type DeepKey<T> = keyof Deep<T>;
type DeArray<A> = A extends (infer T)[] ? T : never;

/*
type Optional<T extends Record<string, any>, OptionalKeys extends string> =
    {[K in OptionalKeys]?: T[K]} &
    {[K in Exclude<keyof T, OptionalKeys>]: T[K]};
*/

type Optional<T extends Record<string, any>, OptionalK extends string> =
    Omit<T, OptionalK> &
    {[K in OptionalK]?: T[K]}

export type UpdateDoc<Doc> = Partial<Omit<Doc, "_id">>;
export type InsertDoc<Doc> = Optional<Doc, "_id" | "createdAt" | "updatedAt">

export type QueryOperators<T> =
    Partial<{
        $in: T[]
        $nin: T[]
        $ne: T
        $gt: (T extends string ? string : never) |
            (T extends number ? number : never)
        $lt: (T extends string ? string : never) |
            (T extends number ? number : never)
        $gte: (T extends string ? string : never) |
            (T extends number ? number : never)
        $lte: (T extends string ? string : never) |
            (T extends number ? number : never)
        $exists: boolean,
        $regex: T extends string ? RegExp : never,
        $size: T extends Array<any> ? number : never,
        $elemMatch: Partial<T> | QueryOperators<DeArray<T>>,
    }>

export type LogicalOperators<T> = {
    $not: Partial<T> | QueryOperators<T> | Record<string, any>,
    $where: (this: T) => boolean,
    $or: (Partial<T> | QueryOperators<T> | Record<string, any>)[]
    $and: (Partial<T> | QueryOperators<T> | Record<string, any>)[]
}

export type FilterQuery<Doc> =
    Partial<LogicalOperators<Doc>> & 
    Partial<{[K in keyof Doc]: Doc[K] | QueryOperators<Doc[K]>}> &
    Partial<{[K in keyof Deep<Doc>]: Deep<Doc>[K] | QueryOperators<Deep<Doc>[K]>}>

export type SortQuery<Doc> =
    Partial<Record<keyof Doc, -1 | 1>> &
    Partial<Record<DeepKey<Doc>, 1 | -1>>;

export type Projection<Doc> =
    (
        { _id?: 1 | 0 } &
        Record<keyof Doc, 0> &
        Record<DeepKey<Doc>, 0>
    ) | (
        {_id?: 1 | 0} &
        Record<keyof Doc, 1> &
        Record<DeepKey<Doc>, 1>
    );

export type UpdateOperators<Doc> = {
    $set:
        { [K in keyof Omit<Doc, "_id">]?: Doc[K] } &
        Record<DeepKey<Doc>, any>

    $unset:
        Record<Exclude<keyof Doc, "_id">, boolean> &
        Record<DeepKey<Doc>, boolean>

    $push:
        {
            [K in keyof Doc]: Doc[K] extends Array<any> ?
            DeArray<Doc[K]> | {
                $each: Doc[K]
                $slice?: number
            } : never
        } &
        Record<DeepKey<Doc>, any>

    $addToSet:
        {
            [K in keyof Doc]: Doc[K] extends Array<any> ?
            DeArray<Doc[K]> | {
                $each: Doc[K]
                $slice?: number
            } : never
        } &
        Record<
            DeepKey<Doc>, 
            {$each: any, $slice?: number} | any
        >
        
    $pull:
        {
            [K in keyof Doc]: 
                Doc[K] extends Array<any> ?
                    Partial<DeArray<Doc[K]>> | 
                    FilterQuery<Doc[K]> |
                    {
                        $each: Partial<DeArray<Doc[K]>>
                        $slice?: number
                    }  : 
                never
        } &
        Record<
            DeepKey<Doc>, 
            FilterQuery<any> | {
                $each: any | FilterQuery<any>, 
                $slice?: number
            } | any
        >

    $slice:
        {[K in keyof Doc]: Doc[K] extends Array<any> ? number : never} &
        Record<DeepKey<Doc>, number>

    $pop:
        { [K in keyof Doc]: Doc[K] extends Array<any> ? number : never } &
        Record<DeepKey<Doc>, number>



    $inc:
        { [K in keyof Doc]?: Doc[K] extends number ? number : never } &
        Record<DeepKey<Doc>, number>

    $dec:
        { [K in keyof Doc]?: Doc[K] extends number ? number : never } &
        Record<DeepKey<Doc>, number>

    $min:
        {[K in keyof Doc]?: Doc[K] extends number ? number : never} &
        Record<DeepKey<Doc>, number>


    $max:
        {[K in keyof Doc]?: Doc[K] extends number ? number : never} &
        Record<DeepKey<Doc>, number>
}

export type UpdateQuery<Doc> =
    UpdateDoc<Doc> |
    Partial<UpdateOperators<Doc>>;

export type IndexOptions<Doc> = {
    fieldName: keyof Doc
    unique?: boolean
    sparse?: boolean
    expireAfterSeconds?: number
}

export type RemoveOptions = {
    multi?: boolean
};

export type DatastoreOptions = {
    filename?: string
    autoload?: boolean
    inMemoryOnly?: boolean
    timestampData?: boolean
    corruptAlertThreshold?: number
    onload?: (error?: Error | null) => void
    compareStrings?: (s1: string, s2: string) => -1 | 0 | 1
} & SerializationOptions

export type SerializationOptions = {
    afterSerialization: (src: string) => string
    beforeSerialization: (src: string) => string
} | {}


export default class Nedb<T> extends EventEmitter {
    
    constructor(opts?: string | DatastoreOptions);
    
    persistence: Persistence;

    /**
     * Load the database from the datafile, and trigger the execution of buffered commands if any
     */
    loadDatabase(cb?: (err: OptionalError) => void): void;

    /**
     * Get an array of all the data in the database
     */
    getAllData(): Document<T>[];

    /**
     * Reset all currently defined indexes
     */
    resetIndexes(newData: any): void;

    ensureIndex(options: IndexOptions<T>, fn?: (err: OptionalError) => void): void;
    removeIndex(fieldName: keyof Document<T>, fn?: (err: OptionalError) => void): void;

    /**
     * Add one or several document(s) to all indexes
     */
    addToIndexes(doc: InsertDoc<Document<T>> | InsertDoc<Document<T>>[]): void;

    /**
     * Remove one or several document(s) from all indexes
     */
    removeFromIndexes(doc: Document<T> | Document<T>[]): void;

    /**
     * Update one or several documents in all indexes
     * To update multiple documents, oldDoc must be an array of { oldDoc, newDoc } pairs
     * If one update violates a constraint, all changes are rolled back
     */
    updateIndexes(oldDoc: Document<T>, newDoc: InsertDoc<Document<T>>): void;
    updateIndexes(updates: Array<{ oldDoc: Document<T>; newDoc: InsertDoc<T> }>): void;

    /**
     * Return the list of candidates for a given query
     * Crude implementation for now, we return the candidates given by the first usable index if any
     * We try the following query types, in this order: basic match, $in match, comparison match
     * One way to make it better would be to enable the use of multiple indexes if the first usable index
     * returns too much data. I may do it in the future.
     *
     * TODO: needs to be moved to the Cursor module
     */
    getCandidates(filter: FilterQuery<Document<T>>): void;

    insert(newDoc: InsertDoc<Document<T>>, fn?: (err: OptionalError, document: Document<T>) => void): void;
    insert(newDocs: InsertDoc<Document<T>>[], fn?: (err: OptionalError, documents: Document<T>[]) => void): void;

    count(filter: FilterQuery<Document<T>>, fn: (err: OptionalError, n: number) => void): void;
    count(filter: FilterQuery<Document<T>>): CountCursor;

    find(filter: FilterQuery<Document<T>>, projection?: Projection<Document<T>>): Cursor<T>;
    find(filter: FilterQuery<Document<T>>, projection: Projection<Document<T>>, fn?: (err: OptionalError, documents: Document<T>[]) => void): void;
    find(filter: FilterQuery<Document<T>>, fn?: (err: OptionalError, documents: Document<T>[]) => void): void;

    findOne(filter: FilterQuery<Document<T>>, projection?: Projection<Document<T>>, fn?: (err: OptionalError, document: Document<T>) => void): void;
    findOne(query: FilterQuery<Document<T>>, fn?: (err: OptionalError, document: Document<T>) => void): void;

    
    update(
        filter: FilterQuery<Document<T>>,
        update: UpdateQuery<Document<T>>,
        options?: {multi?: boolean, returnUpdatedDocs?: false, upsert?: boolean},
        cb?: (err: OptionalError, numAffected: number, afftectedDocuments: void, upsert: boolean) => void
    ): void;

    update(
        filter: FilterQuery<Document<T>>,
        update: UpdateQuery<Document<T>>,
        options: {multi?: false, returnUpdatedDocs: true, upsert?: boolean},
        cb?: (err: OptionalError, numAffected: number, afftectedDocuments: Document<T>, upsert: boolean) => void
    ): void;


    update(
        filter: FilterQuery<Document<T>>,
        update: UpdateQuery<Document<T>>,
        options: {multi: true, returnUpdatedDocs: true, upsert?: boolean},
        fn?: (err: OptionalError, numAffected: number, affectedDocuments: Document<T>[], upsert: boolean) => void    
    ): void
    
    remove(filter: FilterQuery<Document<T>>, options: RemoveOptions, fn?: (err: OptionalError, n: number) => void): void;
    remove(filter: FilterQuery<Document<T>>, fn?: (err: OptionalError, n: number) => void): void;

    addListener(event: 'compaction.done', fn: () => void): this;
    on(event: 'compaction.done', fn: () => void): this;
    once(event: 'compaction.done', fn: () => void): this;
    prependListener(event: 'compaction.done', fn: () => void): this;
    prependOnceListener(event: 'compaction.done', fn: () => void): this;
    removeListener(event: 'compaction.done', fn: () => void): this;
    off(event: 'compaction.done', fn: () => void): this;
    listeners(event: 'compaction.done'): Array<() => void>;
    rawListeners(event: 'compaction.done'): Array<() => void>;
    listenerCount(event: 'compaction.done'): number;
}

export type Cursor<T> = {
    skip(n: number): Cursor<T>;
    limit(n: number): Cursor<T>;
    sort(sort: SortQuery<T>): Cursor<T>;
    projection(projection: Projection<Document<T>>): Cursor<T>;
    exec(fn: (err: OptionalError, documents: Document<T>[]) => void): void;
}

export type CountCursor = {
    exec(fn: (err: OptionalError, count: number) => void): void;
}

export type Persistence = {
    compactDatafile(): void;
    setAutocompactionInterval(interval: number): void;
    stopAutocompaction(): void;
}