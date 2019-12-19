function dbconnetion(res, query, callme) {
    oracledb.getConnection(
        {
            user: "ZEESHAN",
            password: "123",
            connectString: "127.0.0.1"
        },
        function (err, connection) {

            if (err) {
                console.log("ERRoR");
                res.send(err);
                console.error(err);
                return;
            }

            console.log("Connected Successfully Executing Query");
            connection.execute(
                query
                ,
                function (err, result) {

                    if (err) {
                        console.log("ERROE2");
                        console.error(err);
                        callme(err)
                        return;
                    }
                    console.log("Query Execution Completed")
                    callme(result.rows);

                });
        });
}

module.exports.dbconnetion = dbconnetion;