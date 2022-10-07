function executeRuntimeCommand_with_timeout(args, time, timeout_unit, charset) {
	var exitcode = ''
	var err_desc = '' 
	var process = java.lang.Runtime.getRuntime().exec(args);
	
	var stdoutConsumer = new StreamConsumer(process.getInputStream(), charset);
	var stderrConsumer = new StreamConsumer(process.getErrorStream(), charset);

	if(process.waitFor(time, timeout_unit))
	{
		exitcode = process.exitValue();
	}
	else
	{
		while(process.isAlive())
		{	
			process.destroyForcibly();
			// sleep 200 mili second 
			Packages.java.lang.Thread.sleep(200);
		}
		exitcode = -1;
		err_desc = 'timeout error code -1'
	}
	
	return {
		exitValue :exitcode,
		stdout : stdoutConsumer.getOutput(),
		stderr : stderrConsumer.getOutput() + err_desc 
	};
}

function StreamConsumer(is, charset) {
	var output = '';
	
	var thread = new java.lang.Thread({
		run: function() {
			if (typeof charset !== 'undefined') {
				output = org.apache.commons.io.IOUtils.toString(is, charset);
			} else {
				output = org.apache.commons.io.IOUtils.toString(is);
			}
		}
	});

	this.interrupt = function() {
		thread.interrupt();
	}

	this.getOutput = function() {
		thread.join();
		return output;
	};

	thread.start();
}
